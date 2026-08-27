import asyncio
import os
import edge_tts
import subprocess
import json

VOICE = "zh-CN-XiaoxiaoNeural"
AUDIO_DIR = "/home/wang/MathLogic/public/001-pythagorean-theorem"

SECTIONS_DATA = [
    {
        "id": "section-1",
        "type": "definition",
        "title": "1. 定理基本定义",
        "subtitle": "直角三角形三边几何关系",
        "text": "欢迎来到数学逻辑课。今天我们来深入学习并证明勾股定理。在任意直角三角形中，两直角边 a 和 b 的平方和，等于斜边 c 的平方。"
    },
    {
        "id": "section-2",
        "type": "area-squares-proof",
        "title": "2. 证明法一：三边正方形面积法",
        "subtitle": "直角边正方形面积之和等于斜边正方形面积",
        "formula": "Area(a^2) + Area(b^2) = Area(c^2)",
        "text": "第一种证明方法：三边正方形面积法。我们在直角边 a、b 和斜边 c 上分别构建正方形。直角边正方形面积分别为 a 的平方与 b 的平方。可以看到，这两个正方形的面积相加，恰好等于斜边正方形的面积 c 的平方。"
    },
    {
        "id": "section-3",
        "type": "zhao-shuang-proof",
        "title": "3. 证明法二：赵爽弦图拼接法",
        "subtitle": "四个全等直角三角形围成斜边正方形",
        "formula": "4 \\times (\\frac{1}{2}ab) + (b-a)^2 = c^2",
        "text": "第二种证明方法：我国古代著名的赵爽弦图。将四个全等的直角三角形围成一个边长为 c 的大正方形，中间留有一个边长为 b 减 a 的小正方形。化简总面积后同样精准导出 a 的平方加 b 的平方等于 c 的平方。"
    },
    {
        "id": "section-4",
        "type": "garfield-proof",
        "title": "4. 证明法三：加菲尔德梯形面积法",
        "subtitle": "梯形总面积等于三个内切三角形面积之和",
        "formula": "\\frac{1}{2}(a+b)^2 = 2 \\times (\\frac{1}{2}ab) + \\frac{1}{2}c^2",
        "text": "第三种证明方法：加菲尔德梯形法。利用两个全等直角三角形拼成直角梯形，梯形的总面积等于三个内切三角形的面积之和，展开化简后再次完美证明了勾股定理。"
    }
]

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    # 1. Generate silence audio (0.5s pause between sections)
    silence_file = os.path.join(AUDIO_DIR, "silence.mp3")
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "0.5", "-q:a", "9", "-acodec", "libmp3lame", silence_file], check=True)
    
    file_list_path = os.path.join(AUDIO_DIR, "full_files.txt")
    
    subtitles = []
    sections = []
    
    current_frame = 0
    sub_id = 1
    
    with open(file_list_path, "w", encoding="utf-8") as flist:
        for idx, sec in enumerate(SECTIONS_DATA):
            mp3_name = f"proof_{idx+1}.mp3"
            mp3_path = os.path.join(AUDIO_DIR, mp3_name)
            
            # Synthesize TTS
            await edge_tts.Communicate(sec["text"], VOICE).save(mp3_path)
            
            # Get duration
            res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", mp3_path], capture_output=True, text=True)
            dur = float(res.stdout.strip())
            frame_dur = int(round(dur * 30))
            
            start_f = current_frame
            end_f = current_frame + frame_dur
            
            subtitles.append({
                "id": sub_id,
                "sectionId": sec["id"],
                "startFrame": start_f,
                "endFrame": end_f,
                "text": sec["text"]
            })
            sub_id += 1
            
            sec_copy = dict(sec)
            del sec_copy["text"]
            sec_copy["startFrame"] = start_f
            sec_copy["endFrame"] = end_f + 15 # include pause
            sections.append(sec_copy)
            
            flist.write(f"file '{mp3_name}'\n")
            flist.write("file 'silence.mp3'\n")
            
            current_frame = end_f + 15 # 0.5s pause (15 frames)
            
    full_output = os.path.join(AUDIO_DIR, "audio.mp3")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", file_list_path, "-c", "copy", full_output], check=True)
    
    res_full = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", full_output], capture_output=True, text=True)
    full_dur = float(res_full.stdout.strip())
    total_frames = int(round(full_dur * 30))
    
    print(f"Full combined audio duration: {full_dur:.2f}s, Total Frames: {total_frames}")
    
    summary_data = {
        "id": "001-pythagorean-theorem",
        "title": "勾股定理与其三大经典证明 (Pythagorean Theorem & 3 Proofs)",
        "subtitle": "直角三角形两直角边的平方和等于斜边的平方",
        "formula": "a^2 + b^2 = c^2",
        "audioDurationSeconds": full_dur,
        "fps": 30,
        "durationInFrames": total_frames,
        "audio": {
            "full": "001-pythagorean-theorem/audio.mp3"
        },
        "sections": sections,
        "subtitles": subtitles,
        "proofsData": {
            "section1": {
                "title": "直角三角形基本定义",
                "a": 3,
                "b": 4,
                "c": 5
            },
            "section2": {
                "title": "证明一：三边正方形面积法",
                "desc": "边长为 a, b 的正方形面积之和 (a² + b²) 恰好拼成斜边正方形面积 c²",
                "squareAColor": "#38bdf8",
                "squareBColor": "#818cf8",
                "squareCColor": "#f59e0b"
            },
            "section3": {
                "title": "证明二：中国古代赵爽弦图法",
                "desc": "4个全等直角三角形 (2ab) + 中间小正方形 (b-a)² = 斜边大正方形 c²",
                "triangleColor": "#38bdf8",
                "innerSquareColor": "#f43f5e"
            },
            "section4": {
                "title": "证明三：加菲尔德梯形面积法",
                "desc": "直角梯形总面积 = 2个直角三角形 + 1个等腰直角三角形",
                "trapezoidColor": "#818cf8",
                "hypotenuseTriangleColor": "#f59e0b"
            }
        }
    }
    
    with open(os.path.join(AUDIO_DIR, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)
        
    print("Updated summary.json with 3 proofs successfully!")

if __name__ == "__main__":
    asyncio.run(main())
