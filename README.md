
# 健康維持のためのアプリ

## アプリ概要
例：Next.jsとSupabaseを用いたブログアプリです。  
↑  
面接官が一目で分かるように、使用技術とアプリ概要を端的に記述しましょう。

## サイトイメージ
メインページの画像を貼れると良いです。


## サイトURL

デプロイした後のアプリのメインページURLを貼りましょう。  
https://blogapp-forlecture.vercel.app/



## 使用技術
- フロントエンド：Next.js 15.3
- バックエンド：Next.js 15.3、~Python 3.13.3（FastAPI0.115.12）~
- データベース：Supabase
- デプロイ：Vercel
- バージョン管理：Git、GitHub
- テスト・デバッグ：DevTools（Chrome）
- CI/CD：GitHub Actions（ESLint）

 
## 設計ドキュメント
[要件定義・基本設計・詳細設計の一覧_Googleスプレッドシート](https://docs.google.com/spreadsheets/d/1yBssPgoUI_8TMwVZA2hWOLQj3-l7oirLB2FQ1YJgCww/edit?usp=sharing)

詳細設計時のワイヤーフレーム、ER図、ワークフロー図の画像はdocsディレクトリに格納しています。（[こちらからアクセス](./docs)）


## 機能一覧
- ユーザー登録、ログイン機能（メールアドレスとGoogleアカウント）
- ブログ投稿機能
- チャットボット機能
  - Gemini 2.0 flashモデルを使用

※空白を2つ開けて「-」から始めることで、箇条書きが2段目になります。三段目は空白を4つ開ければ可能です。

## テスト・修正の設計及び実施書
[テスト・修正の設計及び実施書_Googleスプレッドシート](https://docs.google.com/spreadsheets/d/1ph7XaLu4a2k_kDBEpj_ySTBPETJvg5143ZMk5G90DUA/edit?usp=sharing)

## アプリの改善案
[アプリの改善案_Googleスプレッドシート](https://docs.google.com/spreadsheets/d/1fgynpBKhx8zaNkMweeYVQl52bP6Z8dJZOmmY8MHXjQM/edit?usp=sharing)

## 備考
[ESLintの実行結果_GitHub Actions](https://github.com/aihat9161/PortfolioExample_Next.js_BlogAppWorX_ENGINEER-CLASS/actions/runs/14956271682/job/42012343864)


## 📊 バージョン履歴

### v1.5
- 曜日のずれ修正
- 選択時の半透明
- supabaseのテーブル連携

### v1.4
- Googleログイン(OAuth 2.0 クライアント ID) の作成
- error修正

### v1.3
- ログイン機能の実施
- そのほかのエラー修正

### v1.2
- データベース設定
- 設定画面アクセス
- フォントサイズ調整 
- 週開始曜日 : スイッチで日曜/月曜を切り替え
- Google/Apple連携ボタンで設定

### v1.1
- データベース設定 
- サンプルデータ生成 
- グラフ表示 
- 期間切り替え 

### v1.0
- カレンダーで日付を選択
- 体調ボタン（😊良い / 😐普通 / 😷悪い）をタップ
- 記録された体調がカレンダーに色分け表示
- 統計で週間・月間の傾向を確認
