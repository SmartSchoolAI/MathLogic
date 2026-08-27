import asyncio
import os
import edge_tts

TEXT = "欢迎来到数学逻辑课。今天我们来学习勾股定理。对于任意直角三角形，两条直角边 a 和 b 的平方和，等于斜边 c 的平方。即公式：a 的平方加上 b 的平方，等于 c 的平方。"
VOICE = "zh-CN-XiaoxiaoNeural"
OUTPUT_FILE = "/home/wang/MathLogic/public/audio/pythagorean.mp3"
WEBVTT_FILE = "/home/wang/MathLogic/public/audio/pythagorean.vtt"

async def main():
    os.makedirs("/home/wang/MathLogic/public/audio", exist_ok=True)
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="+0%")
    submaker = edge_tts.SubMaker()
    
    with open(OUTPUT_FILE, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)
                
    with open(WEBVTT_FILE, "w", encoding="utf-8") as file:
        file.write(submaker.get_srt())

    print("Audio generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
