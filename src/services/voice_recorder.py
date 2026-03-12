import sounddevice as sd
import soundfile as sf
import keyboard
import numpy as np
import threading
import uuid
import os
import time

LISTENING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Listening"))

class VoiceRecorder:
    def __init__(self):
        self.fs = 16000  # Sample rate
        self.channels = 1 # Mono
        self.recording = False
        self.audio_data = []
        self.stream = None

    def callback(self, indata, frames, time, status):
        if self.recording:
            self.audio_data.append(indata.copy())

    def toggle_record(self):
        if not self.recording:
            # Start recording
            print("🎤 Listening... Speak now! (Press CTRL+SHIFT+V again to stop)")
            self.audio_data = []
            self.recording = True
            self.stream = sd.InputStream(samplerate=self.fs, channels=self.channels, callback=self.callback)
            self.stream.start()
            
            # Play a short bloop sound using windows standard beep
            import winsound
            winsound.Beep(1000, 200)
        else:
            # Stop recording
            self.recording = False
            if self.stream:
                self.stream.stop()
                self.stream.close()
                self.stream = None
            
            # Play a short off bloop
            import winsound
            winsound.Beep(800, 200)
            print("✅ Recording stopped. Processing...")
            
            if self.audio_data:
                final_data = np.concatenate(self.audio_data, axis=0)
                if not os.path.exists(LISTENING_DIR):
                    os.makedirs(LISTENING_DIR)
                
                filename = f"user_voice_{uuid.uuid4().hex[:6]}.wav"
                filepath = os.path.join(LISTENING_DIR, filename)
                sf.write(filepath, final_data, self.fs)
                print(f"📁 Saved to {filepath}")

def main():
    recorder = VoiceRecorder()
    print("=========================================")
    print("Antigravity Voice Assistant Online")
    print("Press [CTRL + SHIFT + V] globally to toggle recording.")
    print("=========================================")
    
    keyboard.add_hotkey('ctrl+shift+v', recorder.toggle_record)
    
    # Block forever
    keyboard.wait()

if __name__ == "__main__":
    main()
