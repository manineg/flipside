import { useState, useRef } from 'react';
import Head from 'next/head';

const TABS = ['Text', 'Image', 'Audio', 'Video'];

export default function Flipside() {
  const [tab, setTab] = useState('Text');
  const [text, setText] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [step, setStep] = useState('input');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const textFileRef = useRef();
  const imgFileRef = useRef();

  const handleTextFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedText(ev.target.result);
    reader.readAsText(file);
  };

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target.result.split(',')[1]);
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    const textVal = text.trim() || uploadedText;
    if (tab === 'Text' && !textVal) { setError('Please enter or upload some text first.'); return; }
    if (tab === 'Image' && !imageBase64) { setError('Please upload an image first.'); return; }
    setError('');
    setStep('loading');

    let content, mode;
    if (tab === 'Text') {
      mode = 'text';
      content = [{ type: 'text', text: `Analyze this and provide a devil's advocate response:\n\n${textVal}` }];
    } else {
      mode = 'image';
      content = [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: 'Describe this image and its visual opposite.' }
      ];
    }

    try {
      const res = await fetch('/api/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ mode, data });
      setStep('result');
    } catch (err) {
      setStep('input');
      setError('Analysis failed: ' + err.message);
    }
  };

  const reset = () => {
    setStep('input');
    setResult(null);
    setText('');
    setUploadedText('');
    setUploadedFileName('');
    setImageBase64(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <>
      <Head>
        <title>Flipside — See the full picture</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Flipside" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          body { background: #f9f6f2; font-family: 'DM Sans', sans-serif; }
          .wrap { max-width: 560px; margin: 0 auto; min-height: 100vh; background: #fff; }
          .header { background: #b5602a; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
          .logo { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
          .logo span { color: #ffd5b5; }
          .tagline { font-size: 10px; color: #ffd5b5; letter-spacing: 0.2em; text-transform: uppercase; }
          .body { padding: 20px; }
          .intro { font-size: 15px; color: #333; line-height: 1.6; margin-bottom: 20px; }
          .label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #b5602a; margin-bottom: 10px; font-weight: 600; font-family: 'DM Mono', monospace; }
          .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
          .tab-btn { flex: 1; padding: 10px 4px; font-size: 12px; font-weight: 600; background: #fff; border: 2px solid #b5602a; border-radius: 8px; color: #b5602a; cursor: pointer; text-align: center; line-height: 1.6; font-family: 'DM Sans', sans-serif; }
          .tab-btn.active { background: #b5602a; color: #fff; }
          textarea { width: 100%; background: #fff; border: 2px solid #b5602a; border-radius: 8px; color: #222; font-family: 'DM Sans', sans-serif; font-size: 15px; padding: 12px; resize: none; height: 130px; outline: none; display: block; }
          textarea::placeholder { color: #ccc; }
          .upload-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 12px; background: #fff8f4; border: 2px dashed #b5602a88; border-radius: 8px; cursor: pointer; }
          .upload-row-text { font-size: 14px; color: #b5602a; font-weight: 600; }
          .upload-row-sub { font-size: 11px; color: #aaa; margin-top: 2px; }
          .file-name { font-size: 12px; color: #b5602a; margin-top: 6px; font-weight: 500; }
          .upload-box { border: 2px dashed #b5602a; border-radius: 8px; padding: 32px 16px; text-align: center; cursor: pointer; background: #fff8f4; }
          .upload-box-text { font-size: 14px; color: #888; margin-top: 10px; }
          .upload-box-sub { font-size: 11px; color: #aaa; margin-top: 6px; }
          .coming { background: #fff8f4; border: 2px dashed #b5602a66; border-radius: 8px; padding: 32px 16px; text-align: center; }
          .coming-text { font-size: 14px; color: #b5602a; font-weight: 600; margin-top: 10px; }
          .coming-sub { font-size: 12px; color: #aaa; margin-top: 4px; }
          .submit-btn { width: 100%; padding: 18px; background: #b5602a; color: #fff; font-size: 17px; font-weight: 700; border: none; border-radius: 8px; margin-top: 16px; cursor: pointer; font-family: 'DM Sans', sans-serif; -webkit-appearance: none; }
          .submit-btn:active { background: #9a4f22; }
          .error { color: #c0392b; font-size: 13px; margin-top: 8px; }
          .loading { text-align: center; padding: 80px 20px; }
          .dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
          .dot { width: 12px; height: 12px; border-radius: 50%; background: #b5602a; animation: pulse 1.4s ease-in-out infinite; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes pulse { 0%,100%{opacity:0.15} 50%{opacity:1} }
          .loading-text { font-size: 13px; color: #999; letter-spacing: 0.2em; text-transform: uppercase; font-family: 'DM Mono', monospace; }
          .section-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #b5602a; margin-bottom: 10px; font-weight: 700; font-family: 'DM Mono', monospace; }
          .claim-box { background: #fff8f4; border-left: 3px solid #b5602a; padding: 14px 16px; margin-bottom: 20px; font-size: 15px; color: #444; line-height: 1.6; border-radius: 0 6px 6px 0; }
          .flip-text { font-size: 15px; color: #222; line-height: 1.8; margin-bottom: 20px; }
          .flip-text p { margin-bottom: 14px; }
          .sources { border-top: 1px solid #eee; padding-top: 16px; }
          .source-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
          .source-num { font-size: 13px; color: #b5602a; min-width: 20px; font-weight: 700; font-family: 'DM Mono', monospace; padding-top: 1px; }
          .source-title { font-size: 14px; color: #222; font-weight: 600; display: block; margin-bottom: 2px; }
          .source-outlet { font-size: 10px; color: #b5602a; text-transform: uppercase; letter-spacing: 0.12em; display: block; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
          .source-desc { font-size: 13px; color: #666; line-height: 1.5; }
          .reset-btn { width: 100%; padding: 14px; background: #fff; color: #b5602a; font-size: 15px; font-weight: 600; border: 2px solid #b5602a; border-radius: 8px; margin-top: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif; -webkit-appearance: none; }
          img.preview { width: 100%; border-radius: 8px; border: 2px solid #b5602a; margin-top: 10px; }
        `}</style>
      </Head>

      <div className="wrap">
        <div className="header">
          <div className="logo">flip<span>side</span></div>
          <div className="tagline">See the full picture</div>
        </div>

        {step === 'input' && (
          <div className="body">
            <p className="intro">Text, audio and video get a sourced counterargument. Images get a visual opposite.</p>

            <div className="label">Choose your format</div>
            <div className="tabs">
              {TABS.map(t => (
                <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {tab === 'Text' && (
              <>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste an article, argument, or opinion — anything that takes a position..."
                />
                <div className="upload-row" onClick={() => textFileRef.current.click()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b5602a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div>
                    <div className="upload-row-text">Or upload a file</div>
                    <div className="upload-row-sub">TXT · PDF · DOCX</div>
                  </div>
                  <input ref={textFileRef} type="file" accept=".txt,.pdf,.doc,.docx" style={{display:'none'}} onChange={handleTextFile} />
                </div>
                {uploadedFileName && <div className="file-name">✓ {uploadedFileName} loaded</div>}
              </>
            )}

            {tab === 'Image' && (
              <>
                <div className="upload-box" onClick={() => imgFileRef.current.click()}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b5602a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <div className="upload-box-text">Tap to upload an image</div>
                  <div className="upload-box-sub">JPG · PNG · WEBP · GIF · Max 5MB</div>
                  <div className="upload-box-sub">No HEIC, RAW, or TIFF files</div>
                  <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{display:'none'}} onChange={handleImg} />
                </div>
                {imagePreview && <img className="preview" src={imagePreview} alt="preview" />}
              </>
            )}

            {(tab === 'Audio' || tab === 'Video') && (
              <div className="coming">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b5602a88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {tab === 'Audio'
                    ? <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                    : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>
                  }
                </svg>
                <div className="coming-text">{tab} coming soon</div>
                <div className="coming-sub">{tab === 'Audio' ? 'MP3 · M4A · WAV' : 'MP4 · MOV'}</div>
              </div>
            )}

            {error && <div className="error">{error}</div>}
            <button className="submit-btn" onClick={analyze}>Submit for Analysis →</button>
          </div>
        )}

        {step === 'loading' && (
          <div className="loading">
            <div className="dots">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <div className="loading-text">Finding the other side</div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="body">
            {result.mode === 'text' && result.data.hasViewpoint && (
              <>
                <div className="section-label">Viewpoint detected</div>
                <div className="claim-box">{result.data.claim}</div>
                <div className="section-label">The flip</div>
                <div className="flip-text">
                  {result.data.flip.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div className="sources">
                  <div className="section-label">Sources</div>
                  {result.data.sources.map((s, i) => (
                    <div key={i} className="source-item">
                      <div className="source-num">{i + 1}</div>
                      <div>
                        <span className="source-title">{s.title}</span>
                        <span className="source-outlet">{s.outlet}</span>
                        <span className="source-desc">{s.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {result.mode === 'image' && (
              <>
                <div className="section-label">Visual summary</div>
                <div className="claim-box">{result.data.visualSummary || 'Image received.'}</div>
                <div className="section-label">The visual flip</div>
                <div className="claim-box">{result.data.flipDescription}</div>
                <div style={{fontSize:13,color:'#999',marginTop:8}}>Visual generation coming in the next version.</div>
              </>
            )}
            <button className="reset-btn" onClick={reset}>← Flip something else</button>
          </div>
        )}
      </div>
    </>
  );
}
