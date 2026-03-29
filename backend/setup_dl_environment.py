#!/usr/bin/env python3
"""
Deep Learning Environment Setup Script
Sets up the Python environment and installs dependencies for MRI analysis.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible."""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported. Please use Python 3.8 or higher.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible!")
    return True

def create_directories():
    """Create necessary directories."""
    print("\n📁 Creating directories...")
    
    directories = [
        "uploads/mri",
        "models/trained_models",
        "logs",
        "data/raw",
        "data/processed",
        "results"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def install_python_dependencies():
    """Install Python dependencies."""
    print("\n📦 Installing Python dependencies...")
    
    # Check if requirements.txt exists
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found!")
        return False
    
    # Install dependencies
    return run_command("pip install -r requirements.txt", "Installing Python packages")

def install_node_dependencies():
    """Install Node.js dependencies."""
    print("\n📦 Installing Node.js dependencies...")
    
    # Check if package.json exists
    if not Path("package.json").exists():
        print("❌ package.json not found!")
        return False
    
    # Install dependencies
    return run_command("npm install", "Installing Node.js packages")

def create_sample_model():
    """Create a sample trained model for testing."""
    print("\n🤖 Creating sample model...")
    
    try:
        # Import and create model
        sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))
        from mri_cnn import MRICNNModel
        
        # Create model
        model = MRICNNModel()
        
        # Save model
        model_path = "models/trained_models/sample_model.h5"
        model.save_model(model_path)
        
        print(f"✅ Sample model created at: {model_path}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create sample model: {e}")
        return False

def test_installation():
    """Test the installation."""
    print("\n🧪 Testing installation...")
    
    try:
        # Test Python imports
        import tensorflow as tf
        import numpy as np
        import cv2
        import pydicom
        import nibabel as nib
        from PIL import Image
        
        print("✅ All Python packages imported successfully!")
        
        # Test TensorFlow
        print(f"✅ TensorFlow version: {tf.__version__}")
        
        # Test GPU availability
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU available: {len(gpus)} device(s)")
        else:
            print("⚠️  No GPU detected, will use CPU")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def create_env_file():
    """Create .env file with default values."""
    print("\n⚙️  Creating .env file...")
    
    env_content = """# NeuroCare Deep Learning Environment Variables

# MongoDB
MONGODB_URI=mongodb://localhost:27017/neurocare

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_TEST_KEY_ID=your_test_key_id
RAZORPAY_TEST_KEY_SECRET=your_test_key_secret

# Server
PORT=3002
NODE_ENV=development

# Deep Learning
MODEL_PATH=models/trained_models/mri_cnn_model.h5
UPLOAD_DIR=uploads/mri
MAX_FILE_SIZE=52428800

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/neurocare.log
"""
    
    if not Path(".env").exists():
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ .env file created with default values")
    else:
        print("⚠️  .env file already exists, skipping creation")

def main():
    """Main setup function."""
    print("🚀 NeuroCare Deep Learning Environment Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if not install_python_dependencies():
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    if not install_node_dependencies():
        print("❌ Failed to install Node.js dependencies")
        sys.exit(1)
    
    # Create sample model
    if not create_sample_model():
        print("⚠️  Failed to create sample model, but continuing...")
    
    # Test installation
    if not test_installation():
        print("❌ Installation test failed")
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update the .env file with your actual configuration values")
    print("2. Start the server: npm start")
    print("3. Test the MRI analysis endpoint")
    print("4. Train your own model with real data (optional)")
    
    print("\n🔧 Available commands:")
    print("- npm start: Start the server")
    print("- npm run dev: Start in development mode")
    print("- python scripts/train_model.py --help: Train a new model")
    print("- python scripts/mri_analysis_runner.py --help: Run analysis")

if __name__ == "__main__":
    main()


