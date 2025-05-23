# Char Lab

キャラクターの360度画像を用いて、擬似的に3Dモデル風の表示を実現するソフトウェアです。

## 使い方

### 画像の準備

**既に背景除去済みの画像がある場合は、この手順は不要です。**

背景除去が必要な場合は、以下の手順に従ってスクリプトを実行してください。スクリプトの実行にはPython環境が必要です。推奨Pythonバージョンについては[.tool-versions](./.tool-versions)をご確認ください。

背景除去は機械学習モデルを利用して行います。そのため、出力結果が完璧でない場合や、再実行により結果が変わる可能性があります。より良い結果を得るためには、以下の条件を満たす画像の使用が望ましいです。

- 背景が単色、単純な模様、またはキャラクターよりもぼやけているもの
- キャラクターの輪郭がはっきりしており、背景とのコントラストが高いもの
- キャラクターが画像内で大きく写っているもの

#### 環境セットアップ

Pythonの実行環境には、Poetryで作成される仮想環境を利用します。

```bash
$ cd ./pre_process
$ pip install poetry
$ poetry install
```

#### スクリプトの実行

背景除去は `./pre_process/extract.py` を以下のコマンドで実行できます。

```bash
$ poetry run python ./extract.py {画像ファイルまたはディレクトリのパス} {出力先ディレクトリのパス}
```

たとえば、`/path/to/input` にある画像を背景除去し、結果を `/path/to/output` に出力する場合は、次のように実行します。

```bash
$ poetry run python ./extract.py /path/to/input /path/to/output
```

入力パスと出力パスには、各環境に合わせた適切なパスを指定してください。  
入力パスにはファイルまたはディレクトリを指定できます。ディレクトリを指定した場合、対象はディレクトリ内のすべての画像となり、ディレクトリ構造を反映して出力されます。ファイルを指定した場合は、単一の画像が処理され、出力は指定されたディレクトリの直下に保存されます。  

出力先ディレクトリが存在しない場合は自動的に作成されます。既にディレクトリが存在し、かつファイルがある場合や、指定パスがファイルの場合は警告が表示され、続行するか確認が求められます。続行後、同名のファイルがある場合は上書きされます。
