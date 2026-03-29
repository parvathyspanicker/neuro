# NeuroCare Deep Learning Training Guide

This document outlines the complete deep learning training process, model architecture, and the end-to-end integration between the frontend interface and the backend model in the NeuroCare project.

## 1. Deep Learning Algorithm & Model Architecture

The core of the MRI analysis relies on a **Convolutional Neural Network (CNN)** specifically designed for image classification tasks. The model is built using TensorFlow and Keras.

### Architecture Details
- **Input Shape**: `224x224x1` (Grayscale images).
- **Architecture Flow**:
  1. **Input Layer**: Accepts the `224x224x1` processed MRI image.
  2. **Convolutional Blocks**: 3 layers of Conv2D with increasing filters (32, 64, 128).
     - Each layer uses a `3x3` kernel, `padding='same'`, and **ReLU** activation.
     - Followed by **Batch Normalization** to stabilize training.
     - **MaxPooling2D** (2x2) is applied to downsample spatial dimensions.
     - **Dropout** (0.25) is used after each block to prevent overfitting.
  3. **Global Average Pooling**: Reduces the 2D feature maps to a 1D feature vector (`GlobalAveragePooling2D`).
  4. **Dense Layers**: 
     - A Fully Connected **Dense** layer with 128 units and **ReLU** activation.
     - A high dropout rate of **Dropout(0.5)** to further prevent overfitting on the fully connected features.
  5. **Output Layer**: A **Dense** layer with 4 units and **Softmax** activation representing the probability distribution over the 4 tumor classes.

### Model Setup
- **Optimizer**: Adam (`learning_rate = 0.001`)
- **Loss Function**: Categorical Crossentropy (suitable for multi-class classification)
- **Metrics**: Accuracy

## 2. Model Classes

The primary classifier supports a **4-class classification** based on brain MRI scans:
1. **glioma** (Primary Brain Tumor)
2. **meningioma** (Meningioma)
3. **notumor** (Normal Brain Scan)
4. **pituitary** (Pituitary Adenoma)

The model maps the predictions to clinical statuses like severity, stages, recommended treatments, and prognosis levels to give users detailed reports.

## 3. Training Process

The deep learning model is trained using Python scripts (`train_tumor_subtypes.py` / `train_model.py`) over labeled dataset folders.

### Data Preparation
- **Dataset Structure**: The training images are stored under `backend/data/raw/Training/` grouped by class folders.
- **Image Preprocessing**: Images (`.jpg`, `.png`, `.dcm`, `.nii`) are loaded using OpenCV/PIL, resized to the target `(224, 224)` shape, and converted to grayscale if needed. Values are normalized to `[0, 1]` or `[0, 255]`.

### Training Loop
- **Data Splitting**: Data is split into training and validation sets (using `Testing` directory or an inline split).
- **Callbacks Strategy**:
  - **EarlyStopping**: Halts training if the validation loss doesn't improve for 5-10 epochs and restores the best weights.
  - **ModelCheckpoint**: Saves the best-performing model (`.keras` format) by monitoring `val_accuracy`.
  - **ReduceLROnPlateau** (Optional): Reduces the learning rate if the model plateaus.
- **Epochs and Batch Size**: Models are typically trained for `10` to `50` epochs with a batch size of `32`.
- **Outputs**: After training, the final model is saved alongside an `_info.json` file containing class mappings and input shapes.

## 4. Full Frontend-to-Backend Connection Flow

The process of a user uploading an image from the React frontend to receiving a prediction from the ML model works as follows:

### Step 1: Frontend Request (React)
- The user operates the `DoctorDashboard` or `DoctorPatientChat` where they can attach an MRI image.
- The UI triggers an API call (e.g., using `axios` or standard `fetch`) posting a `multipart/form-data` payload containing the image.
- **Endpoint Called**: `POST /api/mri/analyze`

### Step 2: Express Backend Reception (Node.js)
- The request hits the Node.js server (`backend/routes/mri_analysis.js`).
- **Multer Middleware**: Captures the image and temporarily saves it to the `backend/uploads/mri/` directory (up to 50MB limit allowed).
- The route controller extracts the saved `imagePath` and optional properties like `patient_id`.

### Step 3: Python ML Execution (Child Process)
- The Express server utilizes Node's `child_process.spawn()` module to invoke the Python runner script asynchronously:
  ```javascript
  const pythonProcess = spawn('python', [
    'scripts/mri_analysis_runner.py',
    '--image', imagePath
  ]);
  ```
- The backend waits for the script to execute and captures `stdout` containing the prediction results and `stderr` for errors.

### Step 4: Machine Learning Inference (Python)
- The Python script `mri_analysis_runner.py` is executed.
- It instantiates `MRICNNModel` via `mri_cnn.py`, which loads the pre-trained `.keras` weights.
- The `predict()` method is called:
  - The raw image is pre-processed (grayscaled, resized to 224x224, batch dimension added).
  - The image passes through the CNN model (`self.model.predict(processed)`).
  - The model outputs an array of probabilities.
  - The script extracts the highest probability class, assigns a confidence score, stage, and corresponding disease information.
- The compiled results are dumped to stdout as a JSON string.

### Step 5: Backend Response back to Frontend
- The Express server listens to `pythonProcess.on('close')` and parses the output JSON string back into a JS Object.
- The backend sends a final JSON response back to the React UI containing the success status, detailed predictions, analysis IDs, and report features.

### Step 6: Frontend Render (React)
- The React component receives the result from the backend.
- The UI displays the predicted tumor type, confidence score, clinical severity, and treatment recommendations seamlessly to the doctor or patient user.
