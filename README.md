# BitWeather
![Vue](https://img.shields.io/badge/Vue-3.5.13-%233fb984?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fvue%2Fv%2F3.5.13)
![Flask](https://img.shields.io/badge/Flask-3.1.0-%2354b6c6?link=https%3A%2F%2Fflask.palletsprojects.com%2Fen%2Fstable%2F)



![1035](https://github.com/user-attachments/assets/2a15f858-35c0-4f26-babf-fbdf9abaf507)

BitWeatherはIPアドレスに基づいて天気や現在時刻を表示するWebアプリです。

## 作成の意図

高校時代や大学生の今でもオンラインで授業をすることが多く、一日中課題などをしていると外を見ることがないまま一日が終わってしまい時間感覚がずれることがありました。
そこでちょっとした休憩の時に壁紙として使うことで画面からも外の状況が分かるようにしたいと思い、作りました。

## URL

[BitWeather](https://bitweather.onrender.com)

## 表示例

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/40987a19-e10b-4fde-bdbe-298ff26c27f2" alt="1805"></td>
    <td><img src="https://github.com/user-attachments/assets/aef08092-a784-4cdb-bda4-df974f388cbb" alt="2300"></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
        現在の天気を一目で確認でき、「薄い雲」など詳細な状況も知ることができます。
        現在時刻はAPIを使って30分ごとに更新するため正確な時間を表示することができます。
    </td>
  </tr>
</table>

## フロー図

![frontend drawio](https://github.com/user-attachments/assets/881dafcd-6176-480e-bbae-441e387b39f4)


![backend drawio](https://github.com/user-attachments/assets/9cf413db-10eb-4fe2-806e-a894d39a7a03)

## 主な使用技術

|Category |Technology Stack |
----|----
|Frontend |Vue(3.5.13), HTML, CSS |
|Backend |Python(3.11.11), Flask(3.1.0) |
|Infrastructure |render.com |
|library |Axios, python-dotenv(1.0.1), pytz(2024.2) |
|etc. |Git, Github, VirtualBox, Waitress, VSCode |

## 工夫したところ

<details>
<summary>冗長性</summary>
    
<li>コードの冗長性をできる限り少なくし、またバックエンドは何かしらのコードが帰ってくるようにしました。</li>

</details>

<details>
<summary>ユーザビリティ</summary>

<li>非同期関数を使い、位置情報もIPを使うことでユーザーが手を動かすことなく設定ができます。</li>
<li>weatherAPIの更新時間の5分後に更新をすることで小さな時間のずれによって古い天気情報を取得してしまうことを防ぎます。</li>

</details>

## 課題や追加予定機能

<details>
<summary>致命的な不具合</summary>

<li>worldTimeApiが上手く時間を渡してくれない</li>
    <ul>そもそもwordtimeapiが不安定？</ul>
    <ul>違うところから時間を取得するように変更する必要があるかも</ul>
    <ul>時刻は環境変数？を使って表示しているためIPに関係なく端末の時間が表示されてしまう</ul>
</details>

<details>
    <summary>デプロイ環境の変更</summary>

<li>現在のサーバーはgithubから自動でサーバーを建ててくれる簡易的なもののため、無料プランではssh接続すらできない。</li>
<li>ほかのサーバーではwsgiが使えないことの方が多いため、cgiを作る必要がある。</li>
</details>

<details>
    <summary>画面に動きをつける</summary>

<li>画面に動きがあるのはそれぞれの更新のタイミングだけなため、背景に動くものを追加する。</li>
</details>

<details>
    <summary>別ページを作る</summary>

<li>数時間後や数日分の天気を表示する天気に特化したページを作る。</li>
</details>

<details>
    <summary>ナッジ要素</summary>

<li>クッキークリッカーのようなボタンを押すことでコインなどが増えるようにする。</li>
<li>壁紙として放置し続けることでコインなどがもらえるようにする。</li>
<li>コインなどを使用することで画面上を変更させる。</li>
    <ul>これらを通して壁紙としておいておきたいと思ってもらえるようにする。</ul>
</details>