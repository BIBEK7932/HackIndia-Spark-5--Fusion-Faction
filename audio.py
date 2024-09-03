import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO

# Initialize the recognizer
recognizer = sr.Recognizer()

# Load the MP3 audio file
audio_file_mp3 = "output_audio.mp3"
audio = AudioSegment.from_mp3(audio_file_mp3)

# Export the audio to a temporary WAV format in memory
with BytesIO() as wav_output:
    audio.export(wav_output, format="wav")
    wav_output.seek(0)  # Reset file pointer to the beginning
    # Use the recognizer to convert audio to text
    with sr.AudioFile(wav_output) as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)

# Print the converted text
print("Converted  into Text:", text)


