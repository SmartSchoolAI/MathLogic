import edge_tts
import asyncio

TEXT = "欢迎来到数学逻辑课。今天我们来学习勾股定理。对于任意直角三角形，两条直角边 a 和 b 的平方和，等于斜边 c 的平方。即公式：a 的平方加上 b 的平方，等于 c 的平方。"
VOICE = "zh-CN-XiaoxiaoNeural"

# Sentences split
sentences = [
    "欢迎来到数学逻辑课。今天我们来学习勾股定理。",
    "对于任意直角三角形，两条直角边 a 和 b 的平方和，等于斜边 c 的平方。",
    "即公式：a 的平方加上 b 的平方，等于 c 的平方。"
]

async def gen_sentence_audio():
    import os
    os.makedirs("/home/wang/MathLogic/public/audio", exist_ok=True)
    
    # We will generate individual sentences or measure timestamps so we can align visual animations with precision.
    for i, s in enumerate(sentences):
        c = edge_tts.Communicate(s, VOICE)
        out_path = f"/home/wang/MathLogic/public/audio/part_{i+1}.mp3"
        await c.save(out_path)
        
        # Get duration
        import subprocess
        res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_path], capture_output=True, text=True)
        dur = float(res.stdout.strip())
        print(f"Part {i+1}: '{s}' -> Duration: {dur:.2f}s ({int(dur*30)} frames)")

if __name__ == "__main__":
    asyncio.run(gen_sentence_audio())
