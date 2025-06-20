# Veo3 Video Generator

AI動画生成ツール - fal.aiのVeo3 APIを使用して、テキストプロンプトや画像から動画を生成します。

## 🎬 デモ

[Live Demo on Render](https://your-app-name.onrender.com)

## ✨ 機能

- 📝 テキストプロンプトから動画生成
- 🖼️ 画像をアップロードして動画化
- ⏱️ 動画の長さ: 8秒（Veo3固定）
- 📐 アスペクト比選択（16:9/9:16/1:1）
- 📊 リアルタイム進捗表示
- 💾 生成した動画のダウンロード
- 🎯 Veo3 APIによる高品質動画生成

## 🚀 セットアップ

### 必要なもの

- Node.js 18以上
- fal.ai APIキー（[こちら](https://fal.ai/dashboard)から取得）

### ローカルでの実行

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/veo3-video-generator.git
cd veo3-video-generator
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集してFAL_KEYを設定
```

4. サーバーを起動
```bash
npm start
```

5. ブラウザで http://localhost:3000 を開く

### コマンドラインでの使用

```bash
# 基本的な使用
npm run generate -- "美しい夕日の海岸"

# 画像から動画を生成
npm run generate -- "車を高速で走らせる" --image car.jpg

# オプション付き
npm run generate -- "ネオン街を歩くロボット" --aspect-ratio 9:16 --output robot.mp4
```

## 🌐 Renderへのデプロイ

### 自動デプロイ（render.yaml使用）

1. [Render](https://render.com)でアカウントを作成

2. 新しいWeb Serviceを作成
   - 「New +」→「Web Service」
   - GitHubアカウントを接続
   - `veo3-video-generator`リポジトリを選択
   - 「Connect」をクリック

3. 環境変数を設定
   - Environmentタブで`FAL_KEY`を追加
   - 値: あなたのfal.ai APIキー

4. 「Create Web Service」をクリック

5. デプロイ完了！
   - URLは `https://veo3-video-generator.onrender.com` のような形式になります

### 注意事項
- 無料プランの場合、15分間アクセスがないとスリープします
- 初回アクセス時は起動に30秒程度かかる場合があります

## 📋 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| FAL_KEY | fal.ai APIキー | ✅ |
| PORT | サーバーポート（デフォルト: 3000） | ❌ |

## 🛠️ 技術スタック

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **API**: fal.ai Veo3
- **Real-time**: Socket.io
- **File Upload**: Multer

## 📄 ライセンス

MIT

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを作成して変更内容を議論してください。