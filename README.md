# Jiggly Mitigator

手書き入力時の手ブレを軽減するJavaScriptクラス。

A JavaScript class that reduces blurring during handwritten input.

## デモ (Demo)

https://wolfeign.github.io/JigglyMitigator/

## 使用方法 (Usage)

使用するには new JigglyMitigator を呼び出しオブジェクトを作成する。

To use it, call new JigglyMitigator to create an object.
The third argument is optional (see below)

`const mitigator = new JigglyMitigator(x, y, null);`

3番目の引数は省略可能なオプションで、指定の仕方は以下のように行う。
(各オプションについては後述)

The third argument is an optional option and can be specified as follows.
(Each option will be explained later)

`new JigglyMitigator(x, y, {  
	fixedDigit: 0  
});`

頂点を追加するには、定義したmitigatorオブジェクトの appendToBuffer() を呼び出す。

To add a vertex, call appendToBuffer() of the defined mitigator object.

`mitigator.appendToBuffer(x, y);`

パス文字列を得るには getPath() を呼び出す。

Call getPath() to get the path string.

`const d = mitigator.getPath();`

## オプション (Option)

### lineDistanceThreshold

点と線の距離のしきい値。
大きければ頂点数が少なくなるがその分カクカクになる。
デフォルト値は 0.15。

Point-to-line distance threshold.
If it is large, the number of vertices will decrease, but it will become choppy accordingly.

### longLineDistanceThreshold

点と点の距離が大きい場合の、点と線の距離のしきい値。
lineDistanceThreshold とほぼ同じ意味合い。
デフォルト値は 0.3。

Point-to-line distance threshold when point-to-point distance is large.
Almost the same meaning as lineDistanceThreshold.
Default value is 0.3.

### distanceThreshold

上記の longLineDistanceThreshold がどの程度の距離で使用されるかを表した数値。
この数値の大きさによって longLineDistanceThreshold が使用されるかどうか決まる。
デフォルト値は 10。

A number representing the distance at which the longLineDistanceThreshold above is used.
The size of this number determines whether longLineDistanceThreshold is used.
Default value is 10.

### fixedDigit

SVGパスの d の文字列に使用される数値の小数点以下の桁数。
ただし 3.00 のような場合はそのまま 3 になる。
デフォルト値は 2。

Number of decimal places in numbers used for string d in SVG path.
However, if it is 3.00, it will remain as 3.
Default value is 2.

## 既知の問題 (Known Issues)

今のところなし。

None for now.

## 更新履歴 (Update Hidtory)

### 2023/12/20 (Wed)

strokeBufferSize の値を距離から算出するようにした。
そのためオプションから削除。

The strokeBufferSize value is now calculated from the distance.
Therefore, it was removed from the options.

### 2023/12/19 (Tue)

下記のサイトを参考に全面的に改修。
またその際、頂点の数が多くなってしまう問題も解決。

Completely revised using the website below as reference.
At that time, the problem of increasing the number of vertices was also resolved.

https://stackoverflow.com/questions/40324313/svg-smooth-freehand-drawing

## 作者 (Author)

Wolfeign(@wolfeign)

## ライセンス (License)

The MIT License (MIT)
