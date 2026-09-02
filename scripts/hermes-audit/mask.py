import sys, json
from PIL import Image, ImageDraw
from collections import Counter

def ring_color(im, x0,y0,x1,y1, pad=6):
    px=im.load(); W,H=im.size
    cs=Counter()
    for x in range(max(0,x0-pad), min(W,x1+pad)):
        for y in (max(0,y0-pad), min(H-1,y1+pad-1)):
            cs[px[x,y]]+=1
    for y in range(max(0,y0-pad), min(H,y1+pad)):
        for x in (max(0,x0-pad), min(W-1,x1+pad-1)):
            cs[px[x,y]]+=1
    return cs.most_common(1)[0][0]

def run(src, dst, rects, scale=3):
    im=Image.open(src).convert('RGB')
    d=ImageDraw.Draw(im)
    for r in rects:
        x0,y0,x1,y1 = [int(v*scale) for v in r[:4]]
        x0=max(0,x0); y0=max(0,y0); x1=min(im.width,x1); y1=min(im.height,y1)
        if x1<=x0 or y1<=y0: continue
        c = tuple(r[4]) if len(r)>4 else ring_color(im,x0,y0,x1,y1)
        d.rectangle([x0,y0,x1-1,y1-1], fill=c)
    im.save(dst)
    return im.size

if __name__=='__main__':
    cfg=json.loads(sys.argv[1])
    print(run(cfg['src'],cfg['dst'],cfg['rects']))
