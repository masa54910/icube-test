"""Offline PCM measurements, not subjective listening or fatigue certification."""
import json, wave
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[2]
m=json.loads((root/'docs/AUDIO_PRODUCTION_MANIFEST.json').read_text())
rows=[]
for a in m['assets']:
    with wave.open(str(root/'tools/audio/masters-v2'/f"{a['id']}.wav")) as w:
        sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64).reshape(-1,2)/32768
    mono=x.mean(axis=1); n=65536; low=total=0
    for start in range(0,len(mono)-n,n):
        spectrum=np.abs(np.fft.rfft(mono[start:start+n]*np.hanning(n)))**2
        low+=spectrum[np.fft.rfftfreq(n,1/sr)<250].sum();total+=spectrum.sum()
    rows.append(dict(file=a['productionFile'],peak=float(np.abs(x).max()),peakTime=float(np.argmax(np.max(np.abs(x),axis=1))/sr),rms=float(np.sqrt(np.mean(x*x))),lowUnder250Ratio=float(low/total) if total else None,seamDelta=float(np.max(np.abs(x[0]-x[-1])))))
(root/'docs/AUDIO_SIGNAL_AUDIT.json').write_text(json.dumps({'method':'Uncompressed source PCM audit; not auditory assessment','assets':rows},indent=2))
print(json.dumps(rows,indent=2))
