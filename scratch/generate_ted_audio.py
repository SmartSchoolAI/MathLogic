import asyncio
import os
import edge_tts
import subprocess
import json

VOICE = "zh-CN-XiaoxiaoNeural"
AUDIO_DIR = "/home/wang/MathLogic/public/001-pythagorean-theorem"

# TED-Ed Style Deep & Intuitive Explanations
TED_SECTIONS = [
    {
        "sectionId": "section-1",
        "sentences": [
            "欢迎来到数学逻辑课。今天我们来深入探讨几何学中最著名的定理——勾股定理。",
            "对于任意直角三角形ABC，直角顶点为A，两条直角边为 a 和 b，斜边为 c。勾股定理指出：两直角边的平方和 a的平方加b的平方，恒等于斜边 c 的平方。"
        ]
    },
    {
        "sectionId": "section-2",
        "sentences": [
            "第一种证明：图形重排分割法。我们构造两个边长均为 a加b 的相同大正方形。",
            "在左图大正方形中，放入四个直角三角形，中间剩余的红色区域面积恰好为 c的平方。在右图大正方形中，我们仅仅将这四个直角三角形重新排列到四周，此时剩余的空白区域被分割为两个正方形，面积分别为 b的平方 与 a的平方！",
            "因为两个大正方形总面积完全相同，且都减去了四个相同的直角三角形，所以剩余的面积必定相等！这就极其直观地证明了 a的平方加b的平方等于c的平方。"
        ]
    },
    {
        "sectionId": "section-3",
        "sentences": [
            "第二种证明：相似三角形作高比例法。在直角三角形ABC中，我们从直角顶点A向斜边BC做一条垂直线AD。",
            "垂线AD将原大三角形分割为两个小直角三角形。根据几何相似性，大三角形与两个小三角形全部相似！",
            "由相似比可得：AB的平方等于BC乘以BD，AC的平方等于BC乘以CD。将两式相加，提取公因式BC，BD加CD刚好等于斜边BC！从而精准推导出 AB的平方加AC的平方等于BC的平方。"
        ]
    },
    {
        "sectionId": "section-4",
        "sentences": [
            "第三种证明：中国古代赵爽弦图法。将四个全等的直角三角形围成一个边长为 c 的大正方形，中间留有一个边长为 b减a 的小正方形。",
            "四个三角形面积总和为 2ab，加上中间小正方形展开式 b的平方减2ab加a的平方。这里的 2ab 与 负2ab 正好相互抵消！最终只剩下 a的平方加b的平方等于c的平方。"
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
    
    file_list_path = os.path.join(AUDIO_DIR, "ted_files.txt")
    
    subtitles = []
    sections = [
        {
            "id": "section-1",
            "type": "definition",
            "title": "1. 勾股定理基本定义",
            "subtitle": "直角三角形ABC与边长 a, b, c 关系",
        },
        {
            "id": "section-2",
            "type": "rearrangement-proof",
            "title": "2. 证明一：图形重排分割法 (TED-Ed经典)",
            "subtitle": "相同大正方形 (a+b)² 减去4个三角形 ⇒ c² = a² + b²",
            "formula": "c^2 = (a+b)^2 - 4 \\times (\\frac{1}{2}ab) = a^2 + b^2",
        },
        {
            "id": "section-3",
            "type": "similarity-proof",
            "title": "3. 证明二：相似三角形高分割法",
            "subtitle": "做斜边垂线AD ⇒ AB²=BC×BD, AC²=BC×CD",
            "formula": "AB^2 + AC^2 = BC \\times (BD + CD) = BC^2",
        },
        {
            "id": "section-4",
            "type": "zhao-shuang-proof",
            "title": "4. 证明三：中国古代赵爽弦图法",
            "subtitle": "2ab + (b-a)² = c² ⇒ 2ab与-2ab抵消",
            "formula": "c^2 = 2ab + (b-a)^2 = a^2 + b^2",
        }
    ]
    
    current_frame = 0
    sub_id = 1
    
    with open(file_list_path, "w", encoding="utf-8") as flist:
        for sec_idx, sec in enumerate(TED_SECTIONS):
            sec_start_f = current_frame
            
            for s_idx, sent_text in enumerate(sec["sentences"]):
                mp3_name = f"ted_sub_{sec_idx+1}_{s_idx+1}.mp3"
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
    
    print(f"TED-Ed style audio synthesized! Duration: {full_dur:.2f}s, Total Frames: {total_frames}")
    
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
        
    print("TED-Ed summary.json generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
