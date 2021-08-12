# Jiggly Mitigator

手書き入力時の手ブレを軽減するJavaScriptプログラム。

JavaScript program to reduce the slight shaking at the time of handwriting input.

### デモ (Demo)

https://wolfeign.github.io/JigglyMitigator/

### 使用方法 (Usage)

xとyをメンバに持つオブジェクトの配列をgetJigglyMitigatedPathに渡すとパスが得られる。
このパスはSVGのd属性と同じものなのでそのまま使用することができる。

引数のthresholdは現状18としているが、小さくすれば線がガクガクになる。

You can get the path by passing an array of objects with x and y as members to the getJigglyMitigatedPath function.
This path is the same as the d attribute of SVG, so you can use it as it is.

The threshold of the argument is currently 18, but if it is made smaller, the line will become jerky.

### 既知の問題 (Known Issues)

小さい波を描くと線がグネグネ動く。

If you draw a small wave, the line will move.

### 作者 (Author)

Wolfeign(@wolfeign)

### ライセンス (License)

The MIT License (MIT)
