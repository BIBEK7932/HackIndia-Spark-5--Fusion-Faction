from moviepy.editor import VideoFileClip
def video_to_audio(input_video, output_audio):
    video_clip = VideoFileClip(input_video)
    audio_clip = video_clip.audio
    audio_clip.write_audiofile(output_audio)

input_video_path = "video.mp4"
output_audio_path = "output_audio.mp3"
video_to_audio(input_video_path, output_audio_path)
