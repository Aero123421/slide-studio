import sys,unittest,tempfile,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from evidence import check,check_claim
from font_audit import normalized,load_contract,pdf_postflight
class EvidenceTests(unittest.TestCase):
    def claim(self,**kw):return dict(id='c',source='Synthetic fixture',op='delta',unit='items',direction='after - before',inputs={'before':500,'after':650},expected={'value':150},**kw)
    def test_correct_difference(self):self.assertTrue(check_claim(self.claim())['passed'])
    def test_amount_mislabelled_as_percentage(self):
        c=self.claim();c['expected']={'value':30};self.assertFalse(check_claim(c)['passed'])
    def test_percent_unit_is_explicit(self):
        c=self.claim();c.update(op='percent-change',expected={'value':30});self.assertRaises(ValueError,check_claim,c)
        c['unit']='%';self.assertTrue(check_claim(c)['passed'])
    def test_sign_and_direction(self):
        c=self.claim();c['direction']='before - after';self.assertFalse(check_claim(c)['passed'])
    def test_missing_pairs_not_zero(self):
        c={'id':'p','source':'fixture','op':'paired','unit':'K','direction':'after - before','inputs':{'rows':[{'before':10,'after':8},{'before':12,'after':None},{'before':9,'after':10}]},'expected':{'n':2,'mean':-.5,'sampleSD':2.1,'below':1}}
        self.assertTrue(check_claim(c)['passed']);c['expected']['sampleSD']=2.3;self.assertFalse(check_claim(c)['passed'])
    def test_zero_ratio(self):
        self.assertFalse(check({'claims':[{'id':'r','source':'fixture','op':'ratio','unit':'%','inputs':{'numerator':1,'denominator':0},'expected':{'value':0}}]})['passed'])
    def test_bad_claims_fail_not_crash(self):
        for c in [None,4,{},self.claim()|{'inputs':{'before':True,'after':5}}]:
            self.assertFalse(check({'claims':[c]})['passed'])
    def test_duplicate_claim(self):self.assertFalse(check({'claims':[self.claim(),self.claim()]})['passed'])
    def test_contract_requires_review_and_rules(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'font.json';p.write_text(json.dumps({'version':1,'status':'draft','rules':[]}));self.assertRaises(ValueError,load_contract,p)
    def test_unicode_pdf_comparison(self):self.assertEqual(normalized('Ｆｉ ﬁ\nＡ\u200e'),normalized('Fi fi a'))
if __name__=='__main__':unittest.main()
