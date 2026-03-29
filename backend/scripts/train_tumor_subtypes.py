#!/usr/bin/env python3
"""
Train a 3-class tumor subtype model (Meningioma, Pituitary, Glioma)
using images extracted under backend/data/raw/Training/...
"""

import os
import sys
import argparse
import json
from pathlib import Path
import logging
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from models.mri_cnn import MRICNNModel
from utils.image_preprocessing import MRIPreprocessor

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('train_tumor_subtypes')


def load_folder_dataset(root_dir: Path, class_map: dict, exts=None):
    if exts is None:
        exts = ['.jpg', '.jpeg', '.png']
    pre = MRIPreprocessor(target_size=(224, 224))
    images, labels = [], []
    for label_name, idx in class_map.items():
        d = root_dir / label_name
        if not d.exists():
            logger.warning(f"Missing class folder: {d}")
            continue
        files = []
        for ext in exts:
            files.extend(list(d.rglob(f'*{ext}')))
            files.extend(list(d.rglob(f'*{ext.upper()}')))
        logger.info(f"Loading {len(files)} images from {label_name}")
        for f in files:
            try:
                img = pre.load_image(str(f))
                proc = pre.preprocess(img)
                images.append(proc)
                labels.append(idx)
            except Exception as e:
                logger.warning(f"Skip {f}: {e}")
    if not images:
        raise RuntimeError("No images loaded")
    return np.array(images), np.array(labels)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--train-dir', default='../data/raw/Training', help='Root training directory with class folders')
    ap.add_argument('--val-dir', default='../data/raw/Testing', help='Optional validation directory')
    ap.add_argument('--save-dir', default='../models/trained_models', help='Where to save the trained model')
    ap.add_argument('--epochs', type=int, default=10)
    ap.add_argument('--batch-size', type=int, default=32)
    args = ap.parse_args()

    train_root = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), args.train_dir)))
    val_root = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), args.val_dir)))
    save_dir = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), args.save_dir)))
    save_dir.mkdir(parents=True, exist_ok=True)

    class_names = ['meningioma', 'pituitary', 'glioma']
    class_to_idx = {n: i for i, n in enumerate(class_names)}

    logger.info(f"Loading training data from {train_root}")
    X_train, y_train = load_folder_dataset(train_root, class_to_idx)
    X_val, y_val = (None, None)
    if val_root.exists():
        logger.info(f"Loading validation data from {val_root}")
        X_val, y_val = load_folder_dataset(val_root, class_to_idx)

    from tensorflow.keras.utils import to_categorical
    y_train_cat = to_categorical(y_train, num_classes=len(class_names))
    if X_val is not None:
        y_val_cat = to_categorical(y_val, num_classes=len(class_names))

    model = MRICNNModel(input_shape=(224, 224, 1), num_classes=len(class_names))
    # Override class names for this instance
    model.class_names = class_names

    callbacks = []
    if X_val is not None:
        from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
        callbacks = [
            ModelCheckpoint(filepath=str(save_dir / 'tumor_subtype_best.keras'), monitor='val_accuracy', save_best_only=True, mode='max', verbose=1),
            EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1)
        ]

    history = model.model.fit(
        X_train, y_train_cat,
        validation_data=(X_val, y_val_cat) if X_val is not None else None,
        epochs=args.epochs,
        batch_size=args.batch_size,
        verbose=1,
        callbacks=callbacks
    )

    out_path = save_dir / 'tumor_subtype_model.keras'
    model.save_model(str(out_path))

    info = {
        'class_names': class_names,
        'num_classes': len(class_names),
        'input_shape': (224, 224, 1)
    }
    with open(str(out_path).replace('.keras', '_info.json'), 'w') as f:
        json.dump(info, f, indent=2)

    print(json.dumps({
        'success': True,
        'model_path': str(out_path)
    }))


if __name__ == '__main__':
    main()


