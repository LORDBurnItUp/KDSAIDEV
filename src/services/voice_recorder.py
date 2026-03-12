import sounddevice as sd
import soundfile as sf
import keyboard
import numpy as np
import uuid
import os
import tkinter as tk
import threading

LISTENING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Listening"))

class VoiceOverlay(tk.Tk):
    def __init__(self):
        super().__init__()
        self.overrideredirect(True)
        self.attributes('-topmost', True)
        self.attributes('-alpha', 0.9)
        self.configure(bg='black')
        
        # Cyberpunk style border
        self.frame = tk.Frame(self, bg='#00ffcc', bd=2)
        self.frame.pack(fill='both', expand=True)

        self.label = tk.Label(
            self.frame, 
            text=" 🎙️ ANTIGRAVITY : SYNCHRONIZING... ", 
            font=("Consolas", 16, "bold"), 
            fg="#00ffcc", 
            bg="#0a0a0a", 
            padx=20, pady=10
        )
        self.label.pack(fill='both', expand=True)

        # Center top of screen
        sw = self.winfo_screenwidth()
        window_width = 500
        self.geometry(f"{window_width}x55+{sw//2 - window_width//2}+30")
        self.withdraw()  # Hidden by default

        self.recording = False
        self.fs = 16000
        self.channels = 1
        self.audio_data = []
        self.stream = None

        # Setup global hotkey (runs in a separate background thread natively by keyboard package)
        keyboard.add_hotkey('ctrl+shift+v', self.trigger_toggle)

    def callback(self, indata, frames, time, status):
        if self.recording:
            self.audio_data.append(indata.copy())

    def trigger_toggle(self):
        # Route the threaded callback back to the main GUI thread
        self.after(0, self.toggle_record)

    def toggle_record(self):
        if not self.recording:
            self.audio_data = []
            self.recording = True
            
            self.label.config(text=" 🎙️ | ANTIGRAVITY LISTENING | 🎙️ ", fg="#00ffcc")
            self.deiconify() # Reveal the floating bar
            self.update()

            self.stream = sd.InputStream(samplerate=self.fs, channels=self.channels, callback=self.callback)
            self.stream.start()
            
            try:
                import winsound
                winsound.Beep(1200, 150)
                winsound.Beep(1600, 200)
            except: pass
        else:
            self.recording = False
            self.label.config(text=" ⚙️ PROCESSING NEURAL AUDIO... ", fg="#ffff00")
            self.update()

            if self.stream:
                self.stream.stop()
                self.stream.close()
                self.stream = None
            
            try:
                import winsound
                winsound.Beep(800, 150)
                winsound.Beep(600, 200)
            except: pass
            
            if self.audio_data:
                final_data = np.concatenate(self.audio_data, axis=0)
                if not os.path.exists(LISTENING_DIR):
                    os.makedirs(LISTENING_DIR)
                
                filename = f"user_voice_{uuid.uuid4().hex[:6]}.wav"
                filepath = os.path.join(LISTENING_DIR, filename)
                sf.write(filepath, final_data, self.fs)
            
            # Briefly show "Processed" text then hide
            self.label.config(text=" ✅ INJECTED INTO SECOND BRAIN ", fg="#00ff00")
            self.update()
            self.after(1500, self.withdraw)

if __name__ == "__main__":
    app = VoiceOverlay()
    app.mainloop()
