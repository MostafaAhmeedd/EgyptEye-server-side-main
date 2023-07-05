import pickle
import sys
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os
import numpy as np
import os
import numpy as np
import tensorflow.keras as keras
import tensorflow as tf
from scipy import spatial
from keras.applications.imagenet_utils import decode_predictions, preprocess_input
from scipy import spatial
import pickle
from scipy import spatial
from tensorflow.keras.applications.vgg16 import VGG16  , preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import Model
def load_dictionary_from_disk(filepath):
    with open(filepath, 'rb') as file:
        dictionary = pickle.load(file)
    return dictionary        
# current_dir = os.path.dirname(os.path.abspath(__file__))
file_path_features = os.path.join(os.getcwd(), "Model/feature_vectors.pkl")
Feature_vectors =load_dictionary_from_disk(file_path_features)
# file_path = os.path.join(os.getcwd(), "Model/finalized_model_vgg16.pkl")
model = VGG16(include_top=False)
# model = pickle.load(open(file_path, 'rb'))



def get_feature(path):
    img = load_img(path,target_size=(224,224))
    img  = img_to_array(img)
    img  = img.reshape((1,img.shape[0],img.shape[1],img.shape[2]))
    img = preprocess_input(img)
    features = model.predict(img,verbose=0)
    features = features.flatten()
    return features
# current_dir = os.path.dirname(os.path.abspath(__file__))


def predict(test_photo_path):
    feature= get_feature(test_photo_path)
    highest_similarity = -1
    highest_similarity_key = None
    for landmark_key, landmark_vectors in Feature_vectors.items():
        for i in landmark_vectors:
            cos_sim = 1 - spatial.distance.cosine(i, feature)
            if cos_sim > highest_similarity:
                highest_similarity = cos_sim
                highest_similarity_key = landmark_key   
        if highest_similarity < 0.2:
            highest_similarity_key = "unknown"                  
    return highest_similarity_key
image_path = sys.stdin.readline().strip()
# image_path = r"D:\Graduation project\Code\Egypteye-server-side-zalata2\EgyptEye-server-side-main\uploads\2.jpg"
predict = predict(image_path)
print(predict)


