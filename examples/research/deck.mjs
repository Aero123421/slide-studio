export default { mode:'workshop',
  "title": "An inspectable threshold trade-off",
  "language": "en",
  "sample": true,
  "css": "\n.slide{background:#f7f5ef;color:#17252d}.g-title{position:absolute;left:70px;top:45px;font:500 44px/1.15 Arial,sans-serif;max-width:1140px;letter-spacing:-1px}.g-purpose{position:absolute;left:73px;top:114px;font:21px/1.4 Arial,sans-serif;max-width:1110px;color:#405a65}.g-demo{position:absolute;left:100px;top:192px;width:1080px;height:420px}.g-demo>svg{width:100%;height:100%}.g-footer{position:absolute;left:72px;right:72px;bottom:28px;font:16px/1.4 Arial,sans-serif;color:#405a65;border-top:1px solid #b9c6c7;padding-top:12px}.g-footer code{float:right;font-size:14px}.study .bar{transform-origin:left center}\n.widget{width:1080px;height:430px;display:grid;grid-template-columns:710px 330px;grid-template-rows:350px 72px;gap:8px 35px;position:relative}.w-plot{width:710px;height:350px;overflow:hidden;background:#edf2f3}.w-plot>svg,.w-plot>canvas{width:100%;height:350px;display:block}.w-controls{display:flex;flex-direction:column;gap:13px;overflow:auto;max-height:350px;padding:2px 8px 8px 0}.w-controls label{display:grid;gap:5px;font:19px/1.25 Arial,sans-serif}.w-controls output{font:16px/1.2 monospace;color:#38515c}.w-controls input[type=range]{width:98%;height:22px;accent-color:#28617b}.w-controls button,.w-controls select{font:18px/1.25 Arial,sans-serif;min-height:40px;padding:8px 12px;background:#fff;color:#17252d;border:1px solid #657f8a;border-radius:3px}.w-controls button:hover{background:#dce6e8}.w-check{grid-template-columns:24px 1fr!important;align-items:center}.w-check input{width:19px;height:19px}.w-status{grid-column:1/3;font:19px/1.4 Arial,sans-serif;color:#334f5c;max-width:1060px;padding-top:6px}.w-controls input[type=file]{width:300px;font-size:14px}.w-plot video{width:100%;height:350px;object-fit:contain;background:#e9eff0}.w-plot audio{position:absolute;left:75px;top:290px;width:550px}.w-plot img{width:100%;height:350px;object-fit:cover}.w-compare,.w-magnifier{position:relative;width:100%;height:350px;overflow:hidden}.w-compare img{position:absolute;inset:0;object-fit:cover}.w-divider{position:absolute;top:0;bottom:0;width:4px;background:#fff}.w-reading{padding:44px}.w-reading h2{font:38px/1.15 Georgia,serif;margin-bottom:24px}.w-reading p{font:25px/1.5 Arial,sans-serif}.w-plot table{width:86%;margin:18px auto;border-collapse:collapse;font:23px/1.4 Arial,sans-serif;text-align:left}.w-plot caption{text-align:left;font-size:18px;padding-bottom:12px}.w-plot th,.w-plot td{padding:10px;border-bottom:1px solid #9cb4bd}.w-plot canvas{touch-action:none}\n\n.research{background:#f7f5ef;color:#152b35;padding:62px;font-family:Arial,sans-serif}.research h1{font:52px/1.12 Georgia,serif;max-width:1040px}.research p{font-size:25px;line-height:1.5}.research .lead{font-size:31px;max-width:880px;margin-top:35px}.research .foot{position:absolute;left:62px;bottom:28px;font-size:16px;color:#4c6067}.research .big{font-size:98px;line-height:1.08}.research .rows{margin-top:48px;display:grid;gap:24px}.research .row{display:flex;gap:38px;align-items:baseline;border-top:1px solid #98a5a4;padding-top:20px}.research .row strong{font-size:30px;min-width:250px}.research table{border-collapse:collapse;width:100%;margin-top:56px;font-size:25px}.research td,.research th{padding:18px;text-align:right;border-bottom:1px solid #b5c0bd}.research th:first-child,.research td:first-child{text-align:left}.research .dark{color:#f7f5ef}.research .rule{height:5px;width:100px;background:#b75237;margin:35px 0}.research .w-plot{height:325px}.research .g-demo{left:62px;top:190px;width:1156px;height:420px}.research .widget{height:420px}",
  "slides": [
    {
      "id": "question",
      "title": "What changes when the threshold moves?",
      "content": "<h1 class=\"big\">One threshold.<br>Two kinds of error.</h1><div class=\"rule\"></div><p class=\"lead\">An inspectable example, not a performance claim.</p><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "scope",
      "title": "The question is about a rule, not model quality.",
      "content": "<h1>The question is about a rule,<br>not model quality.</h1><div class=\"rows\"><div class=\"row\"><strong>Given</strong><p>20 synthetic scores and binary labels.</p></div><div class=\"row\"><strong>Change</strong><p>Predict positive when score ≥ threshold.</p></div><div class=\"row\"><strong>Hold fixed</strong><p>The observations, labels and score scale.</p></div></div><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "data",
      "title": "Keep the observations visible.",
      "content": "<h1>Keep the observations visible.</h1><p class=\"lead\">Every marker is one score; the labels are synthetic.</p><svg viewBox=\"0 0 1100 220\" style=\"position:absolute;left:62px;top:320px;width:1156px;height:230px\" role=\"img\" aria-label=\"Twenty synthetic scores from 0 to 1\"><line x1=\"40\" y1=\"155\" x2=\"1050\" y2=\"155\" stroke=\"#4c6067\"/><circle cx=\"120.8\" cy=\"65\" r=\"9\" fill=\"#b75237\"/><circle cx=\"161.2\" cy=\"92\" r=\"9\" fill=\"#28617b\"/><circle cx=\"191.5\" cy=\"119\" r=\"9\" fill=\"#28617b\"/><circle cx=\"252.1\" cy=\"65\" r=\"9\" fill=\"#28617b\"/><circle cx=\"282.4\" cy=\"92\" r=\"9\" fill=\"#28617b\"/><circle cx=\"322.8\" cy=\"119\" r=\"9\" fill=\"#b75237\"/><circle cx=\"373.3\" cy=\"65\" r=\"9\" fill=\"#28617b\"/><circle cx=\"413.7\" cy=\"92\" r=\"9\" fill=\"#28617b\"/><circle cx=\"444.0\" cy=\"119\" r=\"9\" fill=\"#28617b\"/><circle cx=\"474.3\" cy=\"65\" r=\"9\" fill=\"#28617b\"/><circle cx=\"524.8\" cy=\"92\" r=\"9\" fill=\"#b75237\"/><circle cx=\"555.1\" cy=\"119\" r=\"9\" fill=\"#b75237\"/><circle cx=\"595.5\" cy=\"65\" r=\"9\" fill=\"#b75237\"/><circle cx=\"666.2\" cy=\"92\" r=\"9\" fill=\"#b75237\"/><circle cx=\"726.8000000000001\" cy=\"119\" r=\"9\" fill=\"#b75237\"/><circle cx=\"747.0\" cy=\"65\" r=\"9\" fill=\"#28617b\"/><circle cx=\"787.4\" cy=\"92\" r=\"9\" fill=\"#b75237\"/><circle cx=\"848.0\" cy=\"119\" r=\"9\" fill=\"#b75237\"/><circle cx=\"908.6\" cy=\"65\" r=\"9\" fill=\"#b75237\"/><circle cx=\"979.3000000000001\" cy=\"92\" r=\"9\" fill=\"#b75237\"/><text x=\"40\" y=\"196\" font-size=\"23\">0</text><text x=\"1050\" y=\"196\" font-size=\"23\">1</text></svg><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "explore",
      "title": "Move the rule; watch both errors.",
      "content": "<h1>Move the rule; watch both errors.</h1><div class=\"g-demo\"><div class=\"widget\" data-interactive=\"\" id=\"research-threshold\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div></div><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ],
      "widgets": [
        {
          "id": "research-threshold",
          "kind": "threshold",
          "initial": {
            "threshold": 0.5
          }
        }
      ]
    },
    {
      "id": "compare",
      "title": "A higher threshold trades fewer false positives for more misses.",
      "content": "<h1>A higher threshold trades fewer false positives<br>for more misses in this toy data.</h1><table><caption style=\"text-align:left;font-size:20px\">Same 20 observations; counts sum to 20 in each row.</caption><thead><tr><th>Threshold</th><th>True positive</th><th>False positive</th><th>Missed positive</th><th>True negative</th></tr></thead><tbody><tr><td>0.35</td><td>9</td><td>4</td><td>2</td><td>5</td></tr><tr><td>0.65</td><td>5</td><td>1</td><td>6</td><td>8</td></tr></tbody></table><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "limits",
      "title": "This demonstration cannot select a deployment threshold.",
      "content": "<h1>This demonstration cannot select<br>a deployment threshold.</h1><div class=\"rows\"><div class=\"row\"><strong>No sampling claim</strong><p>The scores and labels were constructed.</p></div><div class=\"row\"><strong>No cost model</strong><p>The relative consequences of the errors are unspecified.</p></div><div class=\"row\"><strong>No validation</strong><p>There is no held-out operational dataset here.</p></div></div><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "next",
      "title": "The next experiment must state its decision rule.",
      "content": "<h1>The next experiment must state<br>its decision rule.</h1><div class=\"rows\"><div class=\"row\"><strong>Define</strong><p>Population, measurement protocol and error costs.</p></div><div class=\"row\"><strong>Measure</strong><p>Performance on a suitable held-out sample.</p></div><div class=\"row\"><strong>Report</strong><p>Counts, uncertainty, comparison and limitations.</p></div></div><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    },
    {
      "id": "close",
      "title": "Use interaction to expose a trade-off, not to hide uncertainty.",
      "content": "<h1 class=\"big\" style=\"font-size:80px\">Expose the trade-off.<br>Keep the uncertainty.</h1><div class=\"rule\"></div><p class=\"lead\">The static handout retains the two selected thresholds.<br>The HTML lets the audience inspect alternatives.</p><p class=\"foot\">Worked research narrative · 20 synthetic observations · not empirical evidence</p>",
      "className": "research ",
      "notes": "Synthetic worked example. Not a scientific result, not a trained model or medical decision system. Data and calculations are in examples/research/data.json.",
      "sources": [
        {
          "file": "examples/research/data.json",
          "status": "illustrative"
        }
      ]
    }
  ]
};
