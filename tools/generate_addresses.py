#!/usr/bin/env python3
"""
generate_addresses.py — BTC Address Pool Generator
الاستخدام: python3 generate_addresses.py --xpub xpub6C... --count 500
"""
import hashlib, struct, hmac, json, argparse, sys

BASE58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
P  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
N  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

def sha256(d):  return hashlib.sha256(d).digest()
def sha256d(d): return sha256(sha256(d))
def rmd160(d):
    h=hashlib.new('ripemd160'); h.update(d); return h.digest()
def hmac512(k,d): return hmac.new(k,d,hashlib.sha512).digest()
def modinv(a,m): return pow(int(a),int(m)-2,int(m))
def padd(P1,P2):
    if P1 is None: return P2
    if P2 is None: return P1
    x1,y1=P1; x2,y2=P2
    if x1==x2:
        if y1!=y2: return None
        lam=(3*x1*x1*modinv(2*y1,P))%P
    else: lam=((y2-y1)*modinv(x2-x1,P))%P
    x3=(lam*lam-x1-x2)%P; y3=(lam*(x1-x3)-y1)%P
    return (x3,y3)
def pmul(k,pt):
    r=None; a=pt
    while k:
        if k&1: r=padd(r,a)
        a=padd(a,a); k>>=1
    return r
def decomp(b):
    x=int.from_bytes(bytes(b[1:33]),'big')
    y2=(x*x*x+7)%P; y=pow(y2,(P+1)//4,P)
    if (y%2)!=(b[0]%2): y=P-y
    return (x,y)
def comp(pt):
    x,y=pt
    return ([2]if y%2==0 else[3])+list(x.to_bytes(32,'big'))
def b58enc(data):
    bdata=bytes(data); count=len(bdata)-len(bdata.lstrip(b'\x00'))
    n=int.from_bytes(bdata,'big'); r=''
    while n: n,rem=divmod(n,58); r=BASE58[rem]+r
    return '1'*count+r
def b58chk(data):
    data=list(data); return b58enc(data+list(sha256d(bytes(data))[:4]))
def b58dec(s):
    n=0
    for c in s: n=n*58+BASE58.index(c)
    out=[]
    for _ in range(82): out.append(n%256); n//=256
    out.reverse(); return out
def parse_xpub(xpub):
    raw=b58dec(xpub); return raw[45:78], raw[13:45]
def derive(pub,chain,idx):
    data=list(pub)+[(idx>>24)&0xFF,(idx>>16)&0xFF,(idx>>8)&0xFF,idx&0xFF]
    I=hmac512(bytes(chain),bytes(data)); IL,IR=I[:32],I[32:]
    k=int.from_bytes(IL,'big')
    if k>=N: return None,None
    pt=padd(pmul(k,(Gx,Gy)),decomp(pub))
    if pt is None: return None,None
    return comp(pt),list(IR)
def pub2addr(pub):
    h160=rmd160(sha256(bytes(pub))); v=[0]+list(h160); return b58chk(v)

def generate(xpub, start=0, count=500):
    pub,chain=parse_xpub(xpub); addresses=[]
    for i in range(start, start+count):
        cp,_=derive(pub,chain,i)
        if cp: addresses.append(pub2addr(cp))
        if (i-start+1)%100==0:
            print(f"  {i-start+1}/{count}...", file=sys.stderr)
    return addresses

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument('--xpub',  required=True)
    p.add_argument('--count', type=int, default=500)
    p.add_argument('--start', type=int, default=0)
    p.add_argument('--out',   default='addresses.json')
    a=p.parse_args()
    print(f"Generating {a.count} addresses...", file=sys.stderr)
    addrs=generate(a.xpub, a.start, a.count)
    with open(a.out,'w') as f: json.dump(addrs,f,indent=2)
    print(f"✅ {len(addrs)} addresses → {a.out}", file=sys.stderr)
    print(f"First: {addrs[0]}", file=sys.stderr)
    print(f"Last:  {addrs[-1]}", file=sys.stderr)
