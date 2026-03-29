#!/usr/bin/env python3
"""
Brain Tumor MRI Classification - Training Script
Uses MobileNetV2 transfer learning for 4-class classification:
  glioma, meningioma, notumor, pituitary

Dataset: https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
)
from sklearn.metrics import classification_report, confusion_matrix
from pathlib import Path
from datetime import datetime

# ── Configuration ──────────────────────────────────────────────────────────────
IMG_SIZE        = (224, 224)
BATCH_SIZE      = 32
EPOCHS_PHASE1   = 15      # Phase 1: train head only (base frozen)
EPOCHS_PHASE2   = 25      # Phase 2: fine-tune top layers
LEARNING_RATE_1 = 1e-3
LEARNING_RATE_2 = 1e-5
FINE_TUNE_FROM  = 100     # Unfreeze layers from this index onward in phase 2

# Paths
SCRIPT_DIR   = Path(__file__).resolve().parent
BASE_DIR     = SCRIPT_DIR.parent                       # backend/
DATASET_DIR  = Path(r"d:\neuro\datasets\archive (1)")
TRAIN_DIR    = DATASET_DIR / "Training"
TEST_DIR     = DATASET_DIR / "Testing"
SAVE_DIR     = BASE_DIR / "models" / "trained_models"

CLASS_NAMES  = ["glioma", "meningioma", "notumor", "pituitary"]


# ── Data Loading ───────────────────────────────────────────────────────────────
def load_datasets():
    """Load training and test datasets using keras utility."""
    print("\n📂 Loading datasets...")
    print(f"   Training: {TRAIN_DIR}")
    print(f"   Testing:  {TEST_DIR}")

    train_ds = keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        class_names=CLASS_NAMES,
        shuffle=True,
        seed=42,
    )

    # Split training into train + validation (85/15)
    total_batches = tf.data.experimental.cardinality(train_ds).numpy()
    val_batches   = int(total_batches * 0.15)
    val_ds        = train_ds.take(val_batches)
    train_ds      = train_ds.skip(val_batches)

    test_ds = keras.utils.image_dataset_from_directory(
        TEST_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        class_names=CLASS_NAMES,
        shuffle=False,
    )

    # Print class distribution
    print(f"\n   Classes: {CLASS_NAMES}")
    print(f"   Train batches: {tf.data.experimental.cardinality(train_ds).numpy()}")
    print(f"   Val batches:   {tf.data.experimental.cardinality(val_ds).numpy()}")
    print(f"   Test batches:  {tf.data.experimental.cardinality(test_ds).numpy()}")

    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(AUTOTUNE)
    val_ds   = val_ds.prefetch(AUTOTUNE)
    test_ds  = test_ds.prefetch(AUTOTUNE)

    return train_ds, val_ds, test_ds


# ── Data Augmentation ──────────────────────────────────────────────────────────
def build_augmentation():
    """Build data augmentation pipeline."""
    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomBrightness(0.1),
        layers.RandomContrast(0.1),
    ], name="data_augmentation")


# ── Model Architecture ─────────────────────────────────────────────────────────
def build_model():
    """Build MobileNetV2 transfer learning model."""
    print("\n🧠 Building model (MobileNetV2 + custom head)...")

    # Load MobileNetV2 without top layers, pretrained on ImageNet
    base_model = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # Freeze for phase 1

    # Build full model
    inputs = keras.Input(shape=(*IMG_SIZE, 3), name="mri_input")

    # Augmentation (only during training)
    x = build_augmentation()(inputs)

    # Preprocessing for MobileNetV2 (scales to [-1, 1])
    x = keras.applications.mobilenet_v2.preprocess_input(x)

    # Base feature extraction
    x = base_model(x, training=False)

    # Classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(len(CLASS_NAMES), activation="softmax", name="predictions")(x)

    model = keras.Model(inputs, outputs, name="brain_tumor_classifier")

    print(f"   Base model layers: {len(base_model.layers)}")
    print(f"   Total params:      {model.count_params():,}")
    trainable = sum(
        tf.reduce_prod(v.shape).numpy() for v in model.trainable_variables
    )
    print(f"   Trainable params:  {trainable:,}")

    return model, base_model


# ── Training ───────────────────────────────────────────────────────────────────
def train(model, base_model, train_ds, val_ds):
    """Two-phase training: frozen base → fine-tune."""
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    best_path = str(SAVE_DIR / "brain_tumor_best.keras")

    callbacks = [
        ModelCheckpoint(best_path, monitor="val_accuracy",
                        save_best_only=True, mode="max", verbose=1),
        EarlyStopping(monitor="val_loss", patience=5,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5,
                          patience=3, min_lr=1e-7, verbose=1),
    ]

    # ── Phase 1: Train classification head only ──
    print(f"\n🚀 Phase 1: Training head only ({EPOCHS_PHASE1} epochs)...")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE_1),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_PHASE1,
        callbacks=callbacks,
        verbose=1,
    )

    # ── Phase 2: Fine-tune top layers of base model ──
    print(f"\n🔧 Phase 2: Fine-tuning from layer {FINE_TUNE_FROM} ({EPOCHS_PHASE2} epochs)...")
    base_model.trainable = True
    for layer in base_model.layers[:FINE_TUNE_FROM]:
        layer.trainable = False

    trainable = sum(
        tf.reduce_prod(v.shape).numpy() for v in model.trainable_variables
    )
    print(f"   Trainable params after unfreeze: {trainable:,}")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE_2),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Reset callbacks with fresh best model path
    callbacks_phase2 = [
        ModelCheckpoint(best_path, monitor="val_accuracy",
                        save_best_only=True, mode="max", verbose=1),
        EarlyStopping(monitor="val_loss", patience=7,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5,
                          patience=3, min_lr=1e-7, verbose=1),
    ]

    total_epochs = EPOCHS_PHASE1 + EPOCHS_PHASE2
    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=total_epochs,
        initial_epoch=EPOCHS_PHASE1,
        callbacks=callbacks_phase2,
        verbose=1,
    )

    return history1, history2


# ── Evaluation ─────────────────────────────────────────────────────────────────
def evaluate(model, test_ds):
    """Evaluate model and print detailed metrics."""
    print("\n📊 Evaluating on test set...")

    # Get predictions
    y_true = []
    y_pred = []

    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Overall accuracy
    accuracy = np.mean(y_true == y_pred)
    print(f"\n   ✅ Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

    # Classification report
    print("\n   Classification Report:")
    print("   " + "-" * 60)
    report = classification_report(y_true, y_pred, target_names=CLASS_NAMES)
    for line in report.split("\n"):
        print(f"   {line}")

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    print("\n   Confusion Matrix:")
    print(f"   {'':>12} " + " ".join(f"{c:>10}" for c in CLASS_NAMES))
    for i, row in enumerate(cm):
        print(f"   {CLASS_NAMES[i]:>12} " + " ".join(f"{v:>10}" for v in row))

    return accuracy, classification_report(y_true, y_pred, target_names=CLASS_NAMES, output_dict=True)


# ── Save Model & Info ──────────────────────────────────────────────────────────
def save_final(model, accuracy, report_dict):
    """Save the final model and metadata."""
    SAVE_DIR.mkdir(parents=True, exist_ok=True)

    # Save model
    model_path = SAVE_DIR / "brain_tumor_model.keras"
    model.save(str(model_path))
    print(f"\n💾 Model saved to: {model_path}")

    # Save model info JSON
    info = {
        "class_names": CLASS_NAMES,
        "num_classes": len(CLASS_NAMES),
        "input_shape": [224, 224, 3],
        "model_type": "MobileNetV2_transfer_learning",
        "test_accuracy": float(accuracy),
        "per_class_metrics": {
            name: {
                "precision": report_dict[name]["precision"],
                "recall": report_dict[name]["recall"],
                "f1_score": report_dict[name]["f1-score"],
            }
            for name in CLASS_NAMES
        },
        "trained_on": "brain-tumor-mri-dataset (Kaggle)",
        "trained_at": datetime.now().isoformat(),
    }

    info_path = SAVE_DIR / "brain_tumor_model_info.json"
    with open(info_path, "w") as f:
        json.dump(info, f, indent=2)
    print(f"   Info saved to: {info_path}")

    return str(model_path), str(info_path)


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  🏥 Brain Tumor MRI Classification - Training Pipeline")
    print("  Using MobileNetV2 Transfer Learning")
    print("=" * 70)

    # Check GPU
    gpus = tf.config.list_physical_devices("GPU")
    print(f"\n🖥️  GPU available: {'Yes (' + gpus[0].name + ')' if gpus else 'No (using CPU)'}")

    # Load data
    train_ds, val_ds, test_ds = load_datasets()

    # Build model
    model, base_model = build_model()

    # Train
    train(model, base_model, train_ds, val_ds)

    # Load best model for evaluation
    best_path = str(SAVE_DIR / "brain_tumor_best.keras")
    if os.path.exists(best_path):
        print(f"\n📥 Loading best model from: {best_path}")
        model = keras.models.load_model(best_path)

    # Evaluate
    accuracy, report_dict = evaluate(model, test_ds)

    # Save final
    model_path, info_path = save_final(model, accuracy, report_dict)

    print("\n" + "=" * 70)
    print(f"  ✅ Training complete!  Test accuracy: {accuracy*100:.2f}%")
    print(f"  📁 Model: {model_path}")
    print(f"  📁 Info:  {info_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()
