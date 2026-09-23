import unittest,tempfile,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from slop_check import review,load_scene,load_pptx
def text(t,x,y,w,h,size,color='#1a1a1a'):return {'type':'text','text':t,'x':x,'y':y,'w':w,'h':h,'size':size,'color':color}
def rect(x,y,w,h,fill):return {'type':'rect','x':x,'y':y,'w':w,'h':h,'fill':fill}
HUES=['#8b5cf6','#14b8a6','#eab308','#f97316']
def sloppy_slide(i,ja=True):
    els=[rect(64,40,4,22,HUES[0]),text('0%d / HOW TO CHOOSE'%i,78,38,500,24,13),text('モデル選びは品質と時間と費用で決まる' if ja else 'Choosing a model balances quality and time',64,80,1100,60,40)]
    for k in range(4):
        x=64+k*290;els+= [rect(x,220,260,300,'#141b25'),rect(x,220,260,5,HUES[k]),text('0%d'%(k+1),x+20,240,80,60,44,HUES[k]),text(['GPT Alpha','GPT Beta','GPT Gamma','Model Delta'][k],x+20,320,220,30,20,HUES[k]),text(f'論点その{i}{k}',x+20,380,220,30,16,HUES[k])]
    els.append(text('FIELD GUIDE · 2026',64,690,400,20,12))
    return {'id':f's{i}','title':'t','layout':'freeform','notes':'Talk track.\n\n[Export] editable; HTML motion flattened.','elements':els}
def clean_slide(i):
    return {'id':f'c{i}','title':'t','layout':'freeform','notes':'Speak to the interval.','elements':[
        text(['受理1件あたりの費用はB案が最も低い','評価条件をそろえると順位が入れ替わる','次の四半期は2件の実務で比較する','価格は入力と出力で100倍の幅がある','結論：B案で小さく始める'][i],64,60,1100,60,40),
        rect(64+i*40,180,700,380,'#f3f4f6'),text('単位：USD / 100万トークン',64,600,500,24,18)]}
def scene(slides):return {'version':1,'width':1280,'height':720,'slides':slides}
def signals(r):return {f['signal'] for f in r['findings']}
class SlopCheck(unittest.TestCase):
    def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.dir=Path(self.tmp.name)
    def tearDown(self):self.tmp.cleanup()
    def run_scene(self,slides):
        p=self.dir/'deck.scene.json';p.write_text(json.dumps(scene(slides),ensure_ascii=False));return review(load_scene(p),'scene')
    def test_generated_look_is_located(self):
        r=self.run_scene([sloppy_slide(i) for i in range(1,7)])
        for sig in ['accent-stripe','decorative-ordinals','latin-eyebrow','repeated-skeleton','card-rows-everywhere','tool-metadata-in-notes','color-identity-reused']:
            self.assertIn(sig,signals(r),sig)
        self.assertGreater(r['errors'],0)
    def test_varied_deck_without_patterns_is_quiet(self):
        r=self.run_scene([clean_slide(i) for i in range(5)])
        self.assertEqual(r['findings'],[])
    def test_status_label_on_canvas_is_an_error(self):
        s=clean_slide(0);s['elements'].append(text('登壇用ドラフト · 2026年9月23日時点',64,650,600,24,16))
        r=self.run_scene([s,clean_slide(1),clean_slide(2)])
        self.assertTrue(any(f['signal']=='status-on-canvas' and f['severity']=='error' for f in r['findings']))
    def test_data_bars_beside_small_labels_are_not_stripes(self):
        s=clean_slide(0)
        for k,w in enumerate([46,61,74]):s['elements']+= [text('段階%d'%k,560,280+k*88,120,24,15),rect(693,283+k*88,w,7,'#2563eb')]
        r=self.run_scene([s,clean_slide(1),clean_slide(2)])
        self.assertNotIn('accent-stripe',signals(r))
    def test_pptx_input_reads_shapes_colors_and_notes(self):
        from pptx import Presentation
        from pptx.util import Inches,Pt
        from pptx.dml.color import RGBColor
        prs=Presentation();prs.slide_width=Inches(13.333);prs.slide_height=Inches(7.5)
        for i in range(5):
            s=prs.slides.add_slide(prs.slide_layouts[6])
            for k in range(3):
                card=s.shapes.add_shape(1,Inches(0.8+k*4),Inches(2.3),Inches(3.6),Inches(3));card.fill.solid();card.fill.fore_color.rgb=RGBColor(0x14,0x1b,0x25)
                bar=s.shapes.add_shape(1,Inches(0.8+k*4),Inches(2.3),Inches(3.6),Inches(0.05));bar.fill.solid();bar.fill.fore_color.rgb=RGBColor(0x8b,0x5c,0xf6)
            tb=s.shapes.add_textbox(Inches(0.8),Inches(0.8),Inches(11),Inches(1));tb.text_frame.text='各モデルの特徴をまとめる';tb.text_frame.paragraphs[0].runs[0].font.size=Pt(32)
            s.notes_slide.notes_text_frame.text='[Export] editable; HTML motion flattened.'
        p=self.dir/'deck.pptx';prs.save(p)
        r=review(load_pptx(p),'pptx')
        self.assertIn('accent-stripe',signals(r));self.assertIn('tool-metadata-in-notes',signals(r))
    def test_bundled_studio_examples_have_no_errors(self):
        import subprocess
        for name in ['technical','executive','talk']:
            out=self.dir/f'{name}.html'
            subprocess.run(['node',str(ROOT/'scripts/studio.mjs'),'build',str(ROOT/f'assets/examples/{name}.json'),'--out',str(out)],check=True,capture_output=True)
            r=review(load_scene(self.dir/f'{name}.scene.json'),'scene')
            self.assertEqual(r['errors'],0,name)
if __name__=='__main__':unittest.main()
