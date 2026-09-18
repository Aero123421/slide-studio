import copy,importlib.util,json,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from evidence import check
spec=importlib.util.spec_from_file_location('verify_review',ROOT/'scripts/verify-review.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class TableBinding(unittest.TestCase):
    def doc(self):
        return {'tables':{'trial':{'source':'Synthetic study, Table 2','version':'revision B',
          'columns':{'single':{'label':'Single estimator','unit':'%','protocol':'held-out error'},'ensemble':{'label':'Ensemble','unit':'%','protocol':'held-out error'}},
          'rows':{'a':{'single':18.25,'ensemble':5.1},'b':{'single':21.4,'ensemble':7.3}}}},
          'claims':[{'id':'baseline','op':'table-cells','table':'trial','column':'single','rows':['a','b'],'unit':'%','digits':1,
          'expected':{'values':[18.3,21.4],'columnLabel':'Single estimator','protocol':'held-out error','sourceVersion':'revision B'}}]}
    def test_rounding_and_one_column(self):self.assertTrue(check(self.doc())['passed'])
    def test_mixed_columns_fail(self):
        d=self.doc();d['claims'][0]['expected']['values'][0]=5.1;self.assertFalse(check(d)['passed'])
    def test_version_label_protocol_and_units_are_not_interchangeable(self):
        for field in ['sourceVersion','columnLabel','protocol']:
            d=self.doc();d['claims'][0]['expected'][field]='different';self.assertFalse(check(d)['passed'])
        d=self.doc();d['claims'][0]['unit']='ms';self.assertFalse(check(d)['passed'])
    def test_missing_or_duplicate_rows_are_not_zero(self):
        for rows in [['a','missing'],['a','a'],['b','a'],[]]:
            d=self.doc();d['claims'][0]['rows']=rows;self.assertFalse(check(d)['passed'])
    def test_malformed_registry_fails_closed(self):
        for table in [None,4,{}, {'columns':[]}]:
            d=self.doc();d['tables']['trial']=table;self.assertFalse(check(d)['passed'])
    def test_boolean_cells_and_strings_are_not_numbers(self):
        for value in [True,'18.25',None,float('nan')]:
            d=self.doc();d['tables']['trial']['rows']['a']['single']=value;self.assertFalse(check(d)['passed'])
    def test_declared_values_do_not_certify_the_source(self):
        d=self.doc();d['tables']['trial']['rows']['a']['single']=999;d['claims'][0]['expected']['values'][0]=999
        self.assertTrue(check(d)['passed']);self.assertIn('mistranscribed',check(d)['limits'])

class FinalReview(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.file=Path(self.temp.name)/'deck.html';self.file.write_text('<h1>Example</h1>')
        self.report={'sha256':module.digest(self.file),'passed':True,'automatedChecksPassed':True,'slides':1,
                     'results':[{'slide':1,'state':'final','passed':True}],'localAssets':[]}
    def test_current_review_is_not_visual_approval(self):
        r=module.verify(self.file,self.report);self.assertTrue(r['passed']);self.assertFalse(r['deliveryApproved'])
    def test_modified_html_rejected(self):
        self.file.write_text('<h1>Rebuilt</h1>');self.assertFalse(module.verify(self.file,self.report)['passed'])
    def test_notes_stripped_build_is_not_the_reviewed_file(self):
        self.report['sha256']='0'*64;self.assertFalse(module.verify(self.file,self.report)['passed'])
    def test_changed_or_missing_local_asset_rejected(self):
        p=self.file.parent/'image.svg';p.write_text('<svg/>');self.report['localAssets']=[{'path':'image.svg','sha256':module.digest(p)}]
        self.assertTrue(module.verify(self.file,self.report)['passed']);p.write_text('<svg>new</svg>');self.assertFalse(module.verify(self.file,self.report)['passed'])
        p.unlink();self.assertFalse(module.verify(self.file,self.report)['passed'])
    def test_failed_incomplete_or_boolean_like_reports_rejected(self):
        for change in [{'passed':'true'},{'passed':1},{'automatedChecksPassed':False},{'results':[]},{'slides':2},{'slides':True},{'errors':['runtime error']},{'cssIntegrity':{'passed':False}}]:
            self.assertFalse(module.verify(self.file,self.report|change)['passed'],change)

if __name__=='__main__':unittest.main()
