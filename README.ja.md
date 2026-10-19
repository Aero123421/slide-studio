# Slide Studio 4

**データから結論を計算し、図は図版エンジンで描き、動きは変化の説明にだけ使い、仕上がりを目で確かめて直す——プレゼンテーションを「設計」するためのAgent Skillです。**

[AIの入口](SKILL.md)／[作例ギャラリー](gallery/index.html)／[検証記録](VERIFICATION.md)／[変更履歴](CHANGELOG.md)／[English](README.md)

```sh
npx skills add Aero123421/slide-studio -g -y
```

Claude Code・Codex・Cursorなど[80以上のエージェント](https://github.com/vercel-labs/skills#supported-agents)に対応しています。
フォルダーごとエージェントのスキル用ディレクトリ（例：`.claude/skills/slide-studio/`）に置いても使えます。
APIキー、アカウント、送信機能、クラウドサービスは不要です。

## エージェントがこのスキルでやること

1. **先に論旨を書く**：1ページに1つの主張。その数字はページのデータから計算します。
2. **図版エンジンで根拠を描く**：45種類のグラフ・図。ラベル幅を自分で測り、日本語は文節で折り返し、注記は枠の内側に収め、単体のSVGとしても書き出せます。
3. **ページを組む**：1280×720のグリッドに、役割で定義した37の配色体系（またはお客様のブランド）を当てます。機械的に見える装飾は使いません。
4. **動きと操作は説明に役立つときだけ**：段階表示、確定した状態どうしの変形、スライドの切り替え、リセットと書き出しを備えた本物の操作部品。
5. **描画結果を見て直す**：全ページ・全段階の一覧画像、配置のQA、計算済みスタイルまで読む「機械っぽさ」検査。原因を直して、もう一度見ます。
6. **納品する**：1ファイルで完結するHTML（発表者ウィンドウ付き）、フォントを確認したPDF、画像版またはネイティブ編集可能なPPTX。

## 4.0の主な変更

| 領域 | 内容 |
|---|---|
| 図版エンジン | `assets/runtime/figure.mjs`：棒（横・縦・グループ・積み上げ・発散）、ダンベル、スロープ、ドット、ロリポップ、ブレット、ウォーターフォール、ワッフル、ユニット、ドーナツ、折れ線・面、スモールマルチプル、ガント、年表、ファネル、サンキー、ヒストグラム、ECDF、箱ひげ、バイオリン、ストリップ、誤差棒、フォレスト、散布図＋回帰帯、ヒートマップ、混同行列、ROC／PR、較正、残差、学習曲線、フロー（階層DAG）、ツリー、シーケンス、ネットワーク、4象限、サイクル、二部グラフ、レイヤー、RACI表、等高線・ベクトル場、シード付きテクスチャ。`--ss-*` トークンでも直接の色指定でも配色できます。 |
| プレイヤー4 | `draw`・`count`・`grow-x/y`・`blur`・`zoom`・`rise`・`wipe-up` などの動き、`data-delay`・`data-stagger`・`data-easing`、`data-states` による変形、スライド切り替え効果、発表者ウィンドウ（現在・次・ノート・タイマー）、暗転、操作一覧、番号ジャンプ、スワイプ、全画面時の操作部自動非表示。 |
| ライブラリー | 実在しない組織の具体的な内容で、完成ページとして作り直しました：図104、動き64、操作24、構成36、テンプレート12パック（72ページ）と作例デッキ。見出しは各ページのデータから計算しています。 |
| 「機械っぽさ」対策 | `slop_check.py` が計算済みスタイルを読み、ドットの方眼背景、光彩、グラデーション文字、すりガラス、影付きカード、字間を空けた英大文字ラベル、「·」の連結、絵文字、チップ、薄い巨大数字、縦積みの英字、何も指していない色付き見出し語、日本語資料での増加への▲を検出します。デザインガイドには「装飾に頼らない個性」の作り方を書きました。 |
| ツール | `craft.mjs init` がエンジン・テーマ・計算済みの雛形を配置、`catalog.mjs take` が依存ファイルとCSSごとコピー、`preview.mjs`、両方式のデッキに対応した `contact-sheet.py`、CSS束と単体SVGを作る `build-studies.mjs`、`build-thumbs.py`、検索できるギャラリー。 |

## 新しく作る

```sh
node scripts/craft.mjs init ./talk --language ja --colors wa-ai
# talk/deck.mjs を編集：先頭にデータ、主張はそこから計算、図は figure.mjs で描く
node scripts/craft.mjs build ./talk/deck.mjs --out ./talk/deck.html --allow-draft
```

`init` は `deck.mjs`、`theme.css`（ページ文法と配色体系1つ）、図版エンジン、キット、短いブリーフを書き出します。
デッキのモジュールは**信頼できるコード**として実行されます。内容が本物になったら `draft:false` にします。
[作り方](references/authoring.md)と[図版エンジン](references/figures.md)を参照してください。

## 素材を探す

[ギャラリー](gallery/index.html)ではサムネイルを見ながら、説明したいこと（例：不確かさ、前後比較、加重平均、コホート）で検索し、種類と言語で絞り込めます。コマンドでも探せます。

```sh
node scripts/catalog.mjs search "不確かさ 比較"
node scripts/catalog.mjs show forest-plot
node scripts/catalog.mjs take forest-plot ./interval-study      # ソース・依存・CSS・単体SVGをコピー
node scripts/catalog.mjs take tpl-qbr ./q2-review               # テンプレートパック6ページをまとめてコピー
```

取り出した素材は**下書き**です。データ・名前・文章を差し替えれば、ページが再計算されます。
テンプレートパック（`gallery/templates.html`）は、それぞれ独自の体裁を持つ6ページ構成のデッキです。

## 描画結果を確かめる

```sh
python -m pip install -r requirements.txt && python -m playwright install chromium
python scripts/contact-sheet.py talk/deck.html --out talk/.studio-review/sheet.png --final --label --frames talk/.studio-review/frames
python scripts/contact-sheet.py talk/deck.html --out talk/.studio-review/steps.png --steps
python scripts/qa.py talk/deck.html --out talk/.studio-review/current --states all
python scripts/qa-summary.py talk/.studio-review/current/report.json
python scripts/slop_check.py talk/deck.html
```

一覧画像と原寸のフレームを必ず目で見てください。QAははみ出し・重なり・コントラスト・切り取り・小さな文字を測りますが、デザインの合格判定ではありません。
症状から原因への対応は[修正ガイド](references/repair.md)にあります。

## 発表と納品

HTMLは1ファイルで完結します。**P** で発表者ウィンドウ、**?** で操作一覧、**B** で暗転、数字＋Enterでページへ移動します。
ノートはHTMLのソースに残るので、聴衆用には `--strip-notes` で書き出します。
PDF・PPTXは静的です。動き・動画・操作部品は残らないため、各スライドの最終状態（または指定した状態）で伝わる構成にします。
フォント確認つきPDF、画像版PPTX、ネイティブ編集できるPPTXの手順は[納品と検証](references/verification-and-delivery.md)を参照してください。

## 会社のブランドを使う

```sh
python scripts/brand-capture.py reference.pptx --out private-brand
node scripts/brand.mjs proof private-brand/brand.json --out private-brand/proof.html --allow-draft
python scripts/brand-template.py private-brand/brand.json --out company-template.potx
```

取り込みはローカルで行い、スライドの本文・ノート・画像は保存しません。結果は承認前の下書きです。[ブランド](references/brand.md)を参照してください。

## 検証

```sh
npm test
python -m unittest discover -s tests -p 'test_*.py'
python tests/browser.py && python tests/navigation.py && python tests/integrity_browser.py && python tests/field_browser.py
npm run build:galleries && npm run build:thumbs
python scripts/audit.py .
```

テストはソフトウェアの動作を確かめるもので、どのモデルでも同じ品質や美しさになることを保証するものではありません。実際に確認した範囲は[検証記録](VERIFICATION.md)にあります。

## 構成とライセンス

`SKILL.md` はエージェントが最初に読む入口、`references/` は必要なときに読む手引き、`assets/` は実行環境・ライブラリー・配色体系、`gallery/` は作例、`examples/` は完成デッキ、`scripts/` は作成・検査・書き出し、`tests/` は回帰テストです。
独自のソースと説明はMITライセンスです。2枚の写真は別途CC0／パブリックドメインです（[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。フォント、アカウント情報、個人情報、利用者のデータは含みません。作例のデータと組織はすべて架空です。

## 3.xからの更新

インストール済みのスキルフォルダーを置き換えます（制作中のプロジェクトはそのまま）。既存のデッキはソースから再ビルドするとプレイヤー4になります。図版エンジンを使うには `assets/runtime/figure.mjs` と `fig-*.mjs` をデッキの隣へコピーするか、`craft.mjs init` で新しく始めてください。
