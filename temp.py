import os
import re
import string

import pandas as pd
import numpy as np

from collections import Counter

import sklearn
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

import tensorflow as tf
from keras import layers
from keras import losses
from keras import regularizers
from keras import preprocessing
from tensorflow.keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import pickle

import matplotlib as mpl
import matplotlib.pyplot as plt
import seaborn as sns


import warnings
warnings.filterwarnings('ignore')

os.chdir("D:\\NLP-Hate-Speech-Detection-master")


main_data=pd.read_csv("train.csv")
data=main_data.copy()
data.drop(columns=['id'],axis=1,inplace=True)


plt.bar([0,1],data['label'].value_counts())
plt.title("class proportions in the dataset")
#plt.show()

#Balancing the dataset using Oversampling
data1=data[data['label']==1]
data0=data[data['label']==0]
data=pd.concat([data,data1,data1], axis=0)
plt.bar([0,1],data['label'].value_counts())
plt.title("class proportions in the dataset")
#plt.show()
def remove_emoji(text):
    emoji_pattern = re.compile("["
                           u"\U0001F600-\U0001F64F"  # emoticons
                           u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                           u"\U0001F680-\U0001F6FF"  # transport & map symbols
                           u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                           u"\U00002702-\U000027B0"
                           u"\U000024C2-\U0001F251"
                           "]+", flags=re.UNICODE)

    return emoji_pattern.sub(r'', text)


def clean_text(text ):
    delete_dict = {sp_character: '' for sp_character in string.punctuation}
    delete_dict[' '] = ' '
    table = str.maketrans(delete_dict)
    text1 = text.translate(table)
    textArr= text1.split()
    text2 = ' '.join([w for w in textArr if ( not w.isdigit() and  ( not w.isdigit() and len(w)>3))])

    return text2.lower()


#preprocess train dataset
data['tweet'] = data['tweet'].apply(remove_emoji)
data['tweet'] = data['tweet'].apply(clean_text)
data['Num_words_text'] = data['tweet'].apply(lambda x:len(str(x).split()))

train_data,test_data= train_test_split(data, test_size=0.2)
train_data.reset_index(drop=True,inplace=True)
test_data.reset_index(drop=True,inplace=True)


X_train, X_valid, y_train, y_valid = train_test_split(train_data['tweet'].tolist(),\
                                                      train_data['label'].tolist(),\
                                                      test_size=0.2,\
                                                      stratify = train_data['label'].tolist(),\
                                                      random_state=0)


num_words = 50000

tokenizer = Tokenizer(num_words=num_words,oov_token="unk")
tokenizer.fit_on_texts(X_train)

x_train_sequences = tokenizer.texts_to_sequences(X_train)
x_valid_sequences = tokenizer.texts_to_sequences(X_valid)
x_test_sequences = tokenizer.texts_to_sequences(test_data['tweet'].tolist())

# Padding sequences
maxlen = 50  # Assuming you want sequences of maximum length 50
x_train_padded = pad_sequences(x_train_sequences, padding='post', maxlen=maxlen)
x_valid_padded = pad_sequences(x_valid_sequences, padding='post', maxlen=maxlen)
x_test_padded = pad_sequences(x_test_sequences, padding='post', maxlen=maxlen)

# Convert labels to NumPy arrays
train_labels = np.asarray(y_train)
valid_labels = np.asarray(y_valid)
test_labels = np.asarray(test_data['label'].tolist())

train_ds = tf.data.Dataset.from_tensor_slices((x_train_padded, train_labels))
valid_ds = tf.data.Dataset.from_tensor_slices((x_valid_padded, valid_labels))
test_ds = tf.data.Dataset.from_tensor_slices((x_test_padded, test_labels))

# Model preparation
max_features = 50000
embedding_dim = 16
sequence_length = maxlen

model = tf.keras.Sequential()
model.add(tf.keras.layers.Embedding(max_features + 1, embedding_dim, embeddings_regularizer=regularizers.l2(0.005)))
model.add(tf.keras.layers.Dropout(0.4))
model.add(tf.keras.layers.LSTM(embedding_dim, dropout=0.2, recurrent_dropout=0.2, return_sequences=True, kernel_regularizer=regularizers.l2(0.005), bias_regularizer=regularizers.l2(0.005)))
model.add(tf.keras.layers.Flatten())
model.add(tf.keras.layers.Dense(512, activation='relu', kernel_regularizer=regularizers.l2(0.001), bias_regularizer=regularizers.l2(0.001)))
model.add(tf.keras.layers.Dropout(0.4))
model.add(tf.keras.layers.Dense(8, activation='relu', kernel_regularizer=regularizers.l2(0.001), bias_regularizer=regularizers.l2(0.001)))
model.add(tf.keras.layers.Dropout(0.4))
model.add(tf.keras.layers.Dense(1, activation='sigmoid'))

model.summary()
model.compile(loss=tf.keras.losses.BinaryCrossentropy(), optimizer=tf.keras.optimizers.Adam(1e-3), metrics=[tf.keras.metrics.BinaryAccuracy()])

epochs = 10
# Fit the model using the train and test datasets.
history = model.fit(train_ds.shuffle(5000).batch(1024),
                    epochs= epochs ,
                    validation_data=valid_ds.batch(1024),
                    verbose=1)

#make predictions on validation dataset
valid_predict = model.predict(valid_ds.batch(1024))[:len(valid_labels)]
# print(valid_predict[:10])

# Tokenize the test data
x_test_sequences = tokenizer.texts_to_sequences(test_data['tweet'].tolist())

# Pad sequences to ensure uniform length
x_test_padded = pad_sequences(x_test_sequences, padding='post', maxlen=maxlen)

# Convert to NumPy array
x_test = np.array(x_test_padded)

# Generate predictions for all samples
predictions = model.predict(x_test)

# model.save('model12.h5')


#plot predictions
f, (ax1, ax2) = plt.subplots(1, 2,figsize=(15,5))
ax1.scatter(predictions,range(0,len(predictions)),alpha=0.2)
ax2=sns.distplot(predictions)


cutoff=0.86
test_data['pred_sentiment']= predictions
test_data['pred_sentiment'] = np.where((test_data.pred_sentiment >= cutoff),1,test_data.pred_sentiment)
test_data['pred_sentiment'] = np.where((test_data.pred_sentiment < cutoff),0,test_data.pred_sentiment)

labels = [0, 1]

final_test=pd.read_csv("test.csv")

ftest=final_test.copy()
ftest.drop(columns=['id'],axis=1,inplace=True)

ftest['tweet'] = ftest['tweet'].apply(remove_emoji)
ftest['tweet'] = ftest['tweet'].apply(clean_text)

f_test_sequences = tokenizer.texts_to_sequences(ftest['tweet'].tolist())
f_test_padded = pad_sequences(f_test_sequences, padding='post', maxlen=maxlen)
f_test = np.array(f_test_padded)

predictions = model.predict(f_test)

#mapping prediction to 1 or 0
ftest['pred_sentiment']= predictions
ftest['pred_sentiment'] = np.where((ftest.pred_sentiment >= cutoff),1,ftest.pred_sentiment)
ftest['pred_sentiment'] = np.where((ftest.pred_sentiment < cutoff),0,ftest.pred_sentiment)

#processed tweets categorized as hate speech
pd.set_option('display.max_colwidth', None)
ftest[ftest['pred_sentiment']==1]


#actual tweets categorized as hate speech
final_test.iloc[ftest[ftest['pred_sentiment']==1].index]


model.save('my_model.h5')

# # Preprocess the input text
# test_data = "be praying for our youth as they prepare for @user camp, june 16-20.  #crossoveolife"
# test_data = remove_emoji(test_data)
# test_data = clean_text(test_data)

# # Tokenize and pad the input text
# test_data_seq = tokenizer.texts_to_sequences([test_data])
# test_data_padded = pad_sequences(test_data_seq, padding='post', maxlen=maxlen)
# cutoff=0.5
# # Predict using the modelL
# prediction = model.predict(test_data_padded)
# print(prediction,cutoff)
# # Map prediction to class
# if prediction>cutoff:
#     print("Yes")
# else:
#     print("No")
