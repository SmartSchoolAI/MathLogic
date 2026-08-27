import asyncio
import os
import edge_tts
import subprocess
import json

VOICE = "zh-CN-XiaoxiaoNeural"
AUDIO_DIR = "/home/wang/MathLogic/public/001-pythagorean-theorem"

FINE_SECTIONS = [
    {
        "sectionId": "section-1",
        "sentences": [
            "欢迎来到数学逻辑课。今天我们来深入学习并证明勾股定理。",
            "在任意直角三角形ABC中，直角边为 a 和 b，斜边为 c。勾股定理指出：a的平方加上b的平方，恒等于斜边c的平方。"
        ]
    },
    {
        "sectionId": "section-2",
        "sentences": [
            "第一种证明方法：三边正方形面积法。我们在直角边 a、b 和斜边 c 上分别向外作正方形。",
            "蓝色的面积为 a的平方，紫色的面积为 b的平方。将这两个正方形面积叠加，恰好填满斜边正方形 c的平方，直观验证了 a的平方加b的平方等于c的平方。"
        ]
    },
    {
        "sectionId": "section-3",
        "sentences": [
            "第二种证明方法：我国古代著名的赵爽弦图。四个直角三角形面积和为 2ab，中间小正方形面积为 b减a的平方。",
            "展开相加得到 2ab 加 b的平方 减 2ab 加 a的平方。这里的 2ab 刚好互相抵消！完美导出 a的平方加b的平方等于c的平方。"
        ]
    },
    {
        "sectionId": "section-4",
        "sentences": [
            "第三种证明方法：加菲尔德梯形法。直角梯形总面积等于三个内切三角形的面积之和。",
            "展开梯形面积公式后，两边的 ab 项刚好互相消去！两边同时乘以 2，再次完美证明了 a的平方加b的平方等于c的平方。"
        ]
    }
]

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    pause_between_sentences = 0.3
    pause_between_sections = 0.6
    
    s_short_path = os.path.join(AUDIO_DIR, "s_short.mp3")
    s_section_path = os.path.join(AUDIO_DIR, "s_section.mp3")
    
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(pause_between_sentences), "-q:a", "9", "-acodec", "libmp3lame", s_short_path], check=True)
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(pause_between_sections), "-q:a", "9", "-acodec", "libmp3lame", s_section_path], check=True)
    
    file_list_path = os.path.join(AUDIO_DIR, "explained_files.txt")
    
    subtitles = []
    sections = [
        {
            "id": "section-1",
            "type": "definition",
            "title": "1. 定理基本定义",
            "subtitle": "直角三角形ABC与边长关系",
        },
        {
            "id": "section-2",
            "type": "area-squares-proof",
            "title": "2. 证明一：三边正方形面积法",
            "subtitle": "Area(a²) + Area(b²) = Area(c²)",
            "formula": "Area(a^2) + Area(b^2) = Area(c^2)",
        },
        {
            "id": "section-3",
            "type": "zhao-shuang-proof",
            "title": "3. 证明二：赵爽弦图抵消证明",
            "subtitle": "2ab + (b-a)² = c² ⇒ 2ab与-2ab抵消",
            "formula": "2ab + (b-a)^2 = c^2 \\Longrightarrow a^2 + b^2 = c^2",
        },
        {
            "id": "section-4",
            "type": "garfield-proof",
            "title": "4. 证明三：加菲尔德梯形抵消法",
            "subtitle": "½(a+b)² = ab + ½c² ⇒ 两侧消去ab",
            "formula": "\\frac{1}{2}(a+b)^2 = ab + \\frac{1}{2}c^2 \\Longrightarrow a^2 + b^2 = c^2",
        }
    ]
    
    current_frame = 0
    sub_id = 1
    
    with open(file_list_path, "w", encoding="utf-8") as flist:
        for sec_idx, sec in enumerate(FINE_SECTIONS):
            sec_start_f = current_frame
            
            for s_idx, sent_text in enumerate(sec["sentences"]):
                mp3_name = f"exp_sub_{sec_idx+1}_{s_idx+1}.mp3"
                mp3_path = os.path.join(AUDIO_DIR, mp3_name)
                
                await edge_tts.Communicate(sent_text, VOICE).save(mp3_path)
                
                res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", mp3_path], capture_output=True, text=True)
                dur = float(res.stdout.strip())
                frame_dur = int(round(dur * 30))
                
                start_f = current_frame
                end_f = current_frame + frame_dur
                
                subtitles.append({
                    "id": sub_id,
                    "sectionId": sec["sectionId"],
                    "startFrame": start_f,
                    "endFrame": end_f,
                    "text": sent_text
                })
                sub_id += 1
                
                flist.write(f"file '{mp3_name}'\n")
                current_frame = end_f
                
                if s_idx < len(sec["sentences"]) - 1:
                    flist.write("file 's_short.mp3'\n")
                    current_frame += int(round(pause_between_sentences * 30))
            
            sec_end_f = current_frame
            sections[sec_idx]["startFrame"] = sec_start_f
            sections[sec_idx]["endFrame"] = sec_end_f + int(round(pause_between_sections * 30))
            
            flist.write("file 's_section.mp3'\n")
            current_frame += int(round(pause_between_sections * 30))
            
    full_output = os.path.join(AUDIO_DIR, "audio.mp3")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", file_list_path, "-c", "copy", full_output], check=True)
    
    res_full = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", full_output], capture_output=True, text=True)
    full_dur = float(res_full.stdout.strip())
    total_frames = int(round(full_dur * 30))
    
    print(f"Explained audio synthesized! Duration: {full_dur:.2f}s, Total Frames: {total_frames}")
    
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
        "subtitles": subtitles
    }
    
    with open(os.path.join(AUDIO_DIR, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)
        
    print("Explained summary.json generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
