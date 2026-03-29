"""
MRI Image Preprocessing Pipeline
Handles various MRI image formats and preprocessing for deep learning models.
"""

import numpy as np
import cv2
import pydicom
import nibabel as nib
from PIL import Image
import SimpleITK as sitk
from typing import Union, Tuple, Optional, List
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MRIPreprocessor:
    """
    Comprehensive MRI image preprocessing pipeline.
    """
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize the MRI preprocessor.
        
        Args:
            target_size: Target size for resizing images (height, width)
        """
        self.target_size = target_size
        self.supported_formats = ['.dcm', '.dicom', '.nii', '.nii.gz', '.jpg', '.jpeg', '.png', '.tiff', '.tif']
    
    def load_image(self, image_path: str) -> np.ndarray:
        """
        Load MRI image from various formats.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Loaded image as numpy array
        """
        image_path = Path(image_path)
        file_extension = image_path.suffix.lower()
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        try:
            if file_extension in ['.dcm', '.dicom']:
                return self._load_dicom(image_path)
            elif file_extension in ['.nii', '.gz']:
                return self._load_nifti(image_path)
            elif file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.tif']:
                return self._load_standard_image(image_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error loading image {image_path}: {e}")
            raise
    
    def _load_dicom(self, image_path: Path) -> np.ndarray:
        """Load DICOM image."""
        try:
            dicom_data = pydicom.dcmread(str(image_path))
            image = dicom_data.pixel_array
            
            # Handle different photometric interpretations
            if hasattr(dicom_data, 'PhotometricInterpretation'):
                if dicom_data.PhotometricInterpretation == 'MONOCHROME1':
                    image = np.max(image) - image
            
            return image.astype(np.float32)
            
        except Exception as e:
            logger.error(f"Error loading DICOM {image_path}: {e}")
            raise
    
    def _load_nifti(self, image_path: Path) -> np.ndarray:
        """Load NIfTI image."""
        try:
            nii_img = nib.load(str(image_path))
            image = nii_img.get_fdata()
            
            # Get middle slice if 3D
            if len(image.shape) == 3:
                middle_slice = image.shape[2] // 2
                image = image[:, :, middle_slice]
            
            return image.astype(np.float32)
            
        except Exception as e:
            logger.error(f"Error loading NIfTI {image_path}: {e}")
            raise
    
    def _load_standard_image(self, image_path: Path) -> np.ndarray:
        """Load standard image formats (JPEG, PNG, etc.)."""
        try:
            image = Image.open(image_path)
            
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            return np.array(image, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Error loading standard image {image_path}: {e}")
            raise
    
    def preprocess(self, image: np.ndarray, normalize: bool = True, 
                  enhance_contrast: bool = True) -> np.ndarray:
        """
        Preprocess MRI image for analysis.
        
        Args:
            image: Input MRI image
            normalize: Whether to normalize the image
            enhance_contrast: Whether to enhance contrast
            
        Returns:
            Preprocessed image
        """
        # Convert to float32 if needed
        if image.dtype != np.float32:
            image = image.astype(np.float32)
        
        # Remove any NaN or infinite values
        image = np.nan_to_num(image, nan=0.0, posinf=0.0, neginf=0.0)
        
        # Normalize to [0, 1] range
        if normalize:
            image = self._normalize_image(image)
        
        # Enhance contrast
        if enhance_contrast:
            image = self._enhance_contrast(image)
        
        # Resize to target size
        image = self._resize_image(image)
        
        # Apply noise reduction
        image = self._denoise_image(image)
        
        return image
    
    def _normalize_image(self, image: np.ndarray) -> np.ndarray:
        """Normalize image to [0, 1] range."""
        min_val = np.min(image)
        max_val = np.max(image)
        
        if max_val > min_val:
            image = (image - min_val) / (max_val - min_val)
        else:
            image = np.zeros_like(image)
        
        return image
    
    def _enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Enhance image contrast using CLAHE."""
        # Convert to uint8 for CLAHE
        image_uint8 = (image * 255).astype(np.uint8)
        
        # Apply CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(image_uint8)
        
        # Convert back to float32
        return enhanced.astype(np.float32) / 255.0
    
    def _resize_image(self, image: np.ndarray) -> np.ndarray:
        """Resize image to target size."""
        if image.shape[:2] != self.target_size:
            image = cv2.resize(image, self.target_size, interpolation=cv2.INTER_LANCZOS4)
        
        return image
    
    def _denoise_image(self, image: np.ndarray) -> np.ndarray:
        """Apply noise reduction."""
        # Convert to uint8 for denoising
        image_uint8 = (image * 255).astype(np.uint8)
        
        # Apply bilateral filter for noise reduction
        denoised = cv2.bilateralFilter(image_uint8, 9, 75, 75)
        
        # Convert back to float32
        return denoised.astype(np.float32) / 255.0
    
    def extract_features(self, image: np.ndarray) -> dict:
        """
        Extract basic features from MRI image.
        
        Args:
            image: Preprocessed MRI image
            
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        # Basic statistics
        features['mean_intensity'] = float(np.mean(image))
        features['std_intensity'] = float(np.std(image))
        features['min_intensity'] = float(np.min(image))
        features['max_intensity'] = float(np.max(image))
        
        # Histogram features
        hist, _ = np.histogram(image, bins=256, range=(0, 1))
        features['histogram_entropy'] = float(-np.sum(hist * np.log2(hist + 1e-10)))
        
        # Texture features (simplified)
        features['texture_energy'] = float(np.sum(image ** 2))
        features['texture_contrast'] = float(np.std(image))
        
        # Shape features
        features['aspect_ratio'] = float(image.shape[1] / image.shape[0])
        features['area'] = float(np.sum(image > 0.1))  # Approximate brain area
        
        return features
    
    def batch_preprocess(self, image_paths: List[str], 
                        normalize: bool = True, 
                        enhance_contrast: bool = True) -> List[np.ndarray]:
        """
        Preprocess multiple images in batch.
        
        Args:
            image_paths: List of image file paths
            normalize: Whether to normalize images
            enhance_contrast: Whether to enhance contrast
            
        Returns:
            List of preprocessed images
        """
        processed_images = []
        
        for image_path in image_paths:
            try:
                # Load image
                image = self.load_image(image_path)
                
                # Preprocess
                processed_image = self.preprocess(image, normalize, enhance_contrast)
                
                processed_images.append(processed_image)
                
            except Exception as e:
                logger.error(f"Error processing {image_path}: {e}")
                # Add zero image as placeholder
                processed_images.append(np.zeros(self.target_size, dtype=np.float32))
        
        return processed_images
    
    def save_preprocessed_image(self, image: np.ndarray, output_path: str) -> None:
        """
        Save preprocessed image to disk.
        
        Args:
            image: Preprocessed image
            output_path: Output file path
        """
        # Convert to uint8 for saving
        image_uint8 = (image * 255).astype(np.uint8)
        
        # Save as PNG
        cv2.imwrite(output_path, image_uint8)
        logger.info(f"Preprocessed image saved to {output_path}")

# Utility functions
def create_preprocessor(target_size: Tuple[int, int] = (224, 224)) -> MRIPreprocessor:
    """Create a new MRI preprocessor instance."""
    return MRIPreprocessor(target_size)

def preprocess_single_image(image_path: str, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """Preprocess a single image file."""
    preprocessor = MRIPreprocessor(target_size)
    image = preprocessor.load_image(image_path)
    return preprocessor.preprocess(image)

def validate_image_format(image_path: str) -> bool:
    """Validate if image format is supported."""
    preprocessor = MRIPreprocessor()
    file_extension = Path(image_path).suffix.lower()
    return file_extension in preprocessor.supported_formats

if __name__ == "__main__":
    # Test the preprocessor
    preprocessor = MRIPreprocessor()
    
    # Test with a sample image (you would replace this with actual image path)
    print("MRI Preprocessor initialized successfully!")
    print(f"Supported formats: {preprocessor.supported_formats}")
    print(f"Target size: {preprocessor.target_size}")

