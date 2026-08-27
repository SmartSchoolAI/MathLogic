import asyncio
import os
import edge_tts
import subprocess

# We synthesize with natural pauses
PART1 = "欢迎来到数学逻辑课。今天我们来学习勾股定理。"
PART2 = "对于任意直角三角形，两条直角边 a 和 b 的平方和，等于斜边 c 的平方。"
PART3 = "即公式：a 的平方加上 b 的平方，等于 c 的平方。"

VOICE = "zh-CN-XiaoxiaoNeural"
AUDIO_DIR = "/home/wang/MathLogic/public/audio"

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    # Save individual parts
    await edge_tts.Communicate(PART1, VOICE).save(os.path.join(AUDIO_DIR, "p1.mp3"))
    await edge_tts.Communicate(PART2, VOICE).save(os.path.join(AUDIO_DIR, "p2.mp3"))
    await edge_tts.Communicate(PART3, VOICE).save(os.path.join(AUDIO_DIR, "p3.mp3"))
    
    # Combine using ffmpeg with small 0.3s silence between parts
    # Generate 0.3s silent mp3
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "0.4", "-q:a", "9", "-acodec", "libmp3lame", os.path.join(AUDIO_DIR, "silence.mp3")], check=True)
    
    # Concat file list
    list_path = os.path.join(AUDIO_DIR, "files.txt")
    with open(list_path, "w") as f:
        f.write("file 'p1.mp3'\n")
        f.write("file 'silence.mp3'\n")
        f.write("file 'p2.mp3'\n")
        f.write("file 'silence.mp3'\n")
        f.write("file 'p3.mp3'\n")
        
    full_output = os.path.join(AUDIO_DIR, "pythagorean_full.mp3")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path, "-c", "copy", full_output], check=True)
    
    # Get exact duration of full audio
    res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", full_output], capture_output=True, text=True)
    dur = float(res.stdout.strip())
    total_frames = int(round(dur * 30)) + 30 # +1s buffer at end
    
    print(f"Full audio combined successfully! Total duration: {dur:.2f}s, Recommended Total Frames: {total_frames}")

if __name__ == "__main__":
    asyncio.run(main())
