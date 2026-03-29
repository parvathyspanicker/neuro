#!/usr/bin/env python3
"""
MRI CNN Model Training Script
Trains the deep learning model for MRI analysis.
"""

import os
import sys
import argparse
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import logging

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'models'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from models.mri_cnn import MRICNNModel
from utils.image_preprocessing import MRIPreprocessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MRIModelTrainer:
    """
    Trainer class for MRI CNN model.
    """
    
    def __init__(self, data_dir: str, model_save_dir: str):
        """
        Initialize the trainer.
        
        Args:
            data_dir: Directory containing training data
            model_save_dir: Directory to save trained models
        """
        self.data_dir = Path(data_dir)
        self.model_save_dir = Path(model_save_dir)
        self.preprocessor = MRIPreprocessor(target_size=(224, 224))
        
        # Create model save directory
        self.model_save_dir.mkdir(parents=True, exist_ok=True)
        
        # Class names and mappings
        self.class_names = [
            'Normal',
            'Mild Cognitive Impairment',
            'Alzheimer\'s Disease',
            'Brain Tumor',
            'Stroke'
        ]
        self.class_to_idx = {name: idx for idx, name in enumerate(self.class_names)}
        self.idx_to_class = {idx: name for name, idx in self.class_to_idx.items()}
    
    def load_dataset(self, data_dir: str) -> tuple:
        """
        Load and preprocess the dataset.
        
        Args:
            data_dir: Directory containing the dataset
            
        Returns:
            Tuple of (images, labels)
        """
        logger.info("Loading dataset...")
        
        images = []
        labels = []
        
        data_path = Path(data_dir)
        
        # Look for class directories
        for class_name in self.class_names:
            class_dir = data_path / class_name
            if not class_dir.exists():
                logger.warning(f"Class directory not found: {class_dir}")
                continue
            
            logger.info(f"Loading images from {class_name}...")
            
            # Get all image files in the class directory
            image_files = []
            for ext in ['.jpg', '.jpeg', '.png', '.dcm', '.dicom', '.nii', '.nii.gz']:
                image_files.extend(class_dir.glob(f'*{ext}'))
                image_files.extend(class_dir.glob(f'*{ext.upper()}'))
            
            for image_file in image_files:
                try:
                    # Load and preprocess image
                    image = self.preprocessor.load_image(str(image_file))
                    processed_image = self.preprocessor.preprocess(image)
                    
                    images.append(processed_image)
                    labels.append(self.class_to_idx[class_name])
                    
                except Exception as e:
                    logger.error(f"Error processing {image_file}: {e}")
                    continue
        
        if not images:
            raise ValueError("No images found in the dataset directory")
        
        logger.info(f"Loaded {len(images)} images from {len(set(labels))} classes")
        
        return np.array(images), np.array(labels)
    
    def create_synthetic_data(self, num_samples_per_class: int = 100) -> tuple:
        """
        Create synthetic data for demonstration purposes.
        In a real scenario, you would use actual MRI data.
        
        Args:
            num_samples_per_class: Number of synthetic samples per class
            
        Returns:
            Tuple of (images, labels)
        """
        logger.info("Creating synthetic dataset for demonstration...")
        
        images = []
        labels = []
        
        for class_idx, class_name in enumerate(self.class_names):
            logger.info(f"Generating {num_samples_per_class} samples for {class_name}")
            
            for _ in range(num_samples_per_class):
                # Create synthetic MRI-like image
                # In reality, this would be actual MRI data
                image = self._generate_synthetic_mri(class_idx)
                
                images.append(image)
                labels.append(class_idx)
        
        logger.info(f"Generated {len(images)} synthetic images")
        
        return np.array(images), np.array(labels)
    
    def _generate_synthetic_mri(self, class_idx: int) -> np.ndarray:
        """
        Generate a synthetic MRI image for demonstration.
        
        Args:
            class_idx: Class index to generate image for
            
        Returns:
            Synthetic MRI image
        """
        # Create base image
        image = np.random.normal(0.5, 0.1, (224, 224))
        
        # Add class-specific patterns
        if class_idx == 0:  # Normal
            # Add some brain-like structures
            image[50:150, 50:150] += 0.2
        elif class_idx == 1:  # Mild Cognitive Impairment
            # Add subtle abnormalities
            image[80:120, 80:120] += 0.1
            image[100:140, 100:140] -= 0.1
        elif class_idx == 2:  # Alzheimer's Disease
            # Add more pronounced abnormalities
            image[60:160, 60:160] += 0.3
            image[90:130, 90:130] -= 0.2
        elif class_idx == 3:  # Brain Tumor
            # Add tumor-like structure
            center_x, center_y = 112, 112
            y, x = np.ogrid[:224, :224]
            mask = (x - center_x)**2 + (y - center_y)**2 <= 30**2
            image[mask] += 0.4
        elif class_idx == 4:  # Stroke
            # Add stroke-like pattern
            image[100:150, 50:100] += 0.3
            image[50:100, 150:200] -= 0.2
        
        # Normalize to [0, 1]
        image = np.clip(image, 0, 1)
        
        return image
    
    def train_model(self, images: np.ndarray, labels: np.ndarray, 
                   epochs: int = 50, batch_size: int = 32, 
                   validation_split: float = 0.2) -> dict:
        """
        Train the MRI CNN model.
        
        Args:
            images: Training images
            labels: Training labels
            epochs: Number of training epochs
            batch_size: Batch size for training
            validation_split: Fraction of data to use for validation
            
        Returns:
            Training history dictionary
        """
        logger.info("Starting model training...")
        
        # Convert labels to categorical
        from tensorflow.keras.utils import to_categorical
        labels_categorical = to_categorical(labels, num_classes=len(self.class_names))
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            images, labels_categorical, 
            test_size=validation_split, 
            random_state=42, 
            stratify=labels
        )
        
        logger.info(f"Training set: {X_train.shape[0]} samples")
        logger.info(f"Validation set: {X_val.shape[0]} samples")
        
        # Create model
        model = MRICNNModel(
            input_shape=(224, 224, 1),
            num_classes=len(self.class_names)
        )
        
        # Add callbacks
        from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
        
        callbacks = [
            ModelCheckpoint(
                filepath=str(self.model_save_dir / 'best_model.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                mode='max',
                verbose=1
            ),
            EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            )
        ]
        
        # Train model
        history = model.model.fit(
            X_train, y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
        
        # Save final model
        final_model_path = self.model_save_dir / 'final_model.h5'
        model.save_model(str(final_model_path))
        
        logger.info("Training completed!")
        
        return {
            'history': history.history,
            'best_model_path': str(self.model_save_dir / 'best_model.h5'),
            'final_model_path': str(final_model_path)
        }
    
    def evaluate_model(self, model_path: str, images: np.ndarray, labels: np.ndarray) -> dict:
        """
        Evaluate the trained model.
        
        Args:
            model_path: Path to the trained model
            images: Test images
            labels: Test labels
            
        Returns:
            Evaluation results
        """
        logger.info("Evaluating model...")
        
        # Load model
        model = MRICNNModel(model_path=model_path)
        
        # Convert labels to categorical
        from tensorflow.keras.utils import to_categorical
        labels_categorical = to_categorical(labels, num_classes=len(self.class_names))
        
        # Evaluate model
        test_loss, test_accuracy, test_precision, test_recall = model.model.evaluate(
            images, labels_categorical, verbose=0
        )
        
        # Make predictions
        predictions = model.model.predict(images, verbose=0)
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Generate classification report
        report = classification_report(
            labels, predicted_classes, 
            target_names=self.class_names, 
            output_dict=True
        )
        
        # Generate confusion matrix
        cm = confusion_matrix(labels, predicted_classes)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.class_names, 
                   yticklabels=self.class_names)
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(self.model_save_dir / 'confusion_matrix.png')
        plt.close()
        
        # Plot training history
        self._plot_training_history()
        
        results = {
            'test_loss': float(test_loss),
            'test_accuracy': float(test_accuracy),
            'test_precision': float(test_precision),
            'test_recall': float(test_recall),
            'classification_report': report,
            'confusion_matrix': cm.tolist(),
            'predictions': predictions.tolist(),
            'true_labels': labels.tolist(),
            'predicted_labels': predicted_classes.tolist()
        }
        
        return results
    
    def _plot_training_history(self):
        """Plot training history."""
        # This would plot the training history if available
        # For now, we'll create a placeholder
        pass
    
    def save_training_results(self, results: dict, output_file: str):
        """
        Save training results to file.
        
        Args:
            results: Training results dictionary
            output_file: Output file path
        """
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Training results saved to {output_file}")

def main():
    """Main function to handle command line arguments."""
    parser = argparse.ArgumentParser(description='Train MRI CNN Model')
    
    parser.add_argument('--data-dir', type=str, required=True, 
                       help='Directory containing training data')
    parser.add_argument('--model-save-dir', type=str, 
                       default='../models/trained_models',
                       help='Directory to save trained models')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32,
                       help='Batch size for training')
    parser.add_argument('--validation-split', type=float, default=0.2,
                       help='Fraction of data for validation')
    parser.add_argument('--synthetic', action='store_true',
                       help='Use synthetic data for demonstration')
    parser.add_argument('--synthetic-samples', type=int, default=100,
                       help='Number of synthetic samples per class')
    parser.add_argument('--evaluate', action='store_true',
                       help='Evaluate the trained model')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Initialize trainer
        trainer = MRIModelTrainer(args.data_dir, args.model_save_dir)
        
        # Load or create dataset
        if args.synthetic:
            logger.info("Using synthetic data for demonstration")
            images, labels = trainer.create_synthetic_data(args.synthetic_samples)
        else:
            images, labels = trainer.load_dataset(args.data_dir)
        
        # Train model
        training_results = trainer.train_model(
            images, labels,
            epochs=args.epochs,
            batch_size=args.batch_size,
            validation_split=args.validation_split
        )
        
        # Evaluate model if requested
        if args.evaluate:
            evaluation_results = trainer.evaluate_model(
                training_results['best_model_path'], images, labels
            )
            training_results['evaluation'] = evaluation_results
        
        # Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        results_file = Path(args.model_save_dir) / f'training_results_{timestamp}.json'
        trainer.save_training_results(training_results, str(results_file))
        
        logger.info("Training completed successfully!")
        logger.info(f"Best model saved to: {training_results['best_model_path']}")
        logger.info(f"Results saved to: {results_file}")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

