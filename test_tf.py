import tensorflow as tf
print(f"TF Version: {tf.__version__}")
try:
    from tensorflow import keras
    print("Keras imported from tensorflow")
except ImportError:
    print("Keras NOT in tensorflow")

try:
    import keras
    print(f"Standalone Keras version: {keras.__version__}")
except ImportError:
    print("Standalone Keras NOT installed")
