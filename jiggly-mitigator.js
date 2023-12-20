// 【JigglyMitigator】
// 
// 手書きの線のブレを軽減するクラス
// A class that reduces blur in handwritten lines
// 
// 以下のサイトを参考に作成
// Created with reference to the following site.
// https://stackoverflow.com/questions/40324313/svg-smooth-freehand-drawing

class JigglyMitigator {
    constructor(x, y, options = null) {
        this.options = {
            lineDistanceThreshold: 0.15,
            longLineDistanceThreshold: 0.3,
            distanceThreshold: 10,
            fixedDigit: 2
        };
        if (null !== options) {
            for (let key in options) {
                if (null !== options[key])
                    this.options[key] = options[key];
            }
        }

        // 平均を割り出す際、どれくらいまで頂点リストを遡るか (この値は座標の距離によって変化する)
        // How far back in the list of vertices to go when calculating the average (this value changes depending on the distance of the coordinates)
        this.strokeBufferSize = 8;

        // 予め2乗しておく
        // Square it in advance
        this.lineDistanceThreshold2 = this.options.lineDistanceThreshold * this.options.lineDistanceThreshold;
        this.longLineDistanceThreshold2 = this.options.longLineDistanceThreshold * this.options.longLineDistanceThreshold;
        this.distanceThreshold2 = this.options.distanceThreshold * this.options.distanceThreshold;

        // ストロークの頂点リスト
        // Stroke vertex list
        this.strokeBuffer = [{
            x: x,
            y: y
        }];
        // 追加頂点リスト
        // Additional vertex list
        this.additionalPoints = [];
        // 一時頂点リスト
        // Temporary vertex list
        this.temporaryPoints = [];

        const fx = this.getFixedValue(x);
        const fy = this.getFixedValue(y);

        // パス
        // Path
        this.strokePath = "M" + fx + " " + fy + " L" + fx + " " + fy;
        // 追加パス
        // Additional path
        this.additionalPath = "";
        // 一時パス
        // Temporary path
        this.temporaryPath = "";

        // 前回の座標と直近の距離リスト
        // Previous coordinates and latest distance list
        this.lastX = 0;
        this.lastY = 0;
        this.distance = [];
    }

    // 頂点を追加
    // Add vertex
    appendToBuffer(x, y) {
        // 直近の距離の平均から strokeBufferSize を割り出す
        // Calculate strokeBufferSize from the average of recent distances
        if (0 === this.distance.length) {
            this.lastX = x;
            this.lastY = y;

            this.distance.push(0);
        } else {
            const d = this.getDistance2(x, y, this.lastX, this.lastY);

            this.distance.push(Math.sqrt(d));
            if (this.distance.length > 20)
                this.distance.shift();

            let total = 0;
            for (let i = 0; i < this.distance.length; i++) {
                total += this.distance[i];
            }
            const avg = total / this.distance.length;

            this.strokeBufferSize = 10 - Math.floor(avg);
            if (this.strokeBufferSize < 6)
                this.strokeBufferSize = 6;

            this.lastX = x;
            this.lastY = y;
        }

        this.strokeBuffer.push({
            x: x,
            y: y
        });

        while (this.strokeBuffer.length > this.strokeBufferSize) {
            this.strokeBuffer.shift();
        }

        this.updateSvgPath();
    }

    // 頂点の平均を得る
    // Get the average of the vertices
    getAveragePoint(offset) {
        const len = this.strokeBuffer.length;
        if (len % 2 === 1 || len >= this.strokeBufferSize) {
            let totalX = 0;
            let totalY = 0;
            let count = 0;

            for (let i = offset; i < len; i++) {
                const pt = this.strokeBuffer[i];
                totalX += pt.x;
                totalY += pt.y;

                count++;
            }

            return {
                x: totalX / count,
                y: totalY / count
            }
        }

        return null;
    }

    // パスデータを更新
    // Update path data
    updateSvgPath() {
        let pt = this.getAveragePoint(0);
        if (pt) {
            this.additionalPoints.push({
                x: pt.x,
                y: pt.y
            });

            // ポリラインを単純化
            // Simplify polyline
            this.additionalPoints = this.toSimple(this.additionalPoints);

            if (this.additionalPoints.length >= 10) {
                for (let i = 0; i < this.additionalPoints.length - 10; i++) {
                    const point = this.additionalPoints[0];

                    this.strokePath += " L" + this.getFixedValue(point.x) + " " + this.getFixedValue(point.y);

                    this.additionalPoints.shift();
                }
            }

            this.additionalPath = "";
            for (let i = 0; i < this.additionalPoints.length; i++) {
                this.additionalPath += " L" + this.getFixedValue(this.additionalPoints[i].x) + " " + this.getFixedValue(this.additionalPoints[i].y);
            }

            this.temporaryPoints.length = 0;
            for (let offset = 2; offset < this.strokeBuffer.length; offset += 2) {
                pt = this.getAveragePoint(offset);
                this.temporaryPoints.push({
                    x: pt.x,
                    y: pt.y
                });
            }

            this.temporaryPath = "";
            for (let i = 0; i < this.temporaryPoints.length; i++) {
                this.temporaryPath += " L" + this.getFixedValue(this.temporaryPoints[i].x) + " " + this.getFixedValue(this.temporaryPoints[i].y);
            }

            return true;
        }

        return false;
    }

    // ポリラインを単純化
    // Simplify polyline
    toSimple(points) {
        for (let i = 2; i < points.length - 1; i++) {
            const point0 = points[i - 2];
            const point1 = points[i - 1];
            const point2 = points[i];
            const point3 = points[i + 1];
            const lpd1 = this.getLinePointDistance2(point1.x, point1.y, point0.x, point0.y, point2.x, point2.y);
            const lpd2 = this.getLinePointDistance2(point2.x, point2.y, point1.x, point1.y, point3.x, point3.y);

            if (lpd2 <= this.lineDistanceThreshold2 && lpd2 < lpd1) {
                points.splice(i--, 1);
            } else {
                const d1 = this.getDistance2(point1.x, point1.y, point2.x, point2.y);
                const d2 = this.getDistance2(point2.x, point2.y, point3.x, point3.y);

                if (d1 >= this.distanceThreshold2 && d2 >= this.distanceThreshold2) {
                    if (lpd2 <= this.longLineDistanceThreshold2) {
                        if (lpd2 < lpd1)
                            points.splice(i--, 1);
                    }
                }
            }
        }

        return points;
    }

    getPath() {
        return this.strokePath + this.additionalPath + this.temporaryPath;
    }

    // 小数点以下の桁数を指定して切り捨て
    // Truncate by specifying the number of digits after the decimal point
    getFixedValue(value) {
        return parseFloat(value.toFixed(this.options.fixedDigit));
    }

    // 点と点の距離の2乗
    // Square of the distance between points
    getDistance2(x1, y1, x2, y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    }

    // 点と線の距離の2乗
    // Square of the distance between a point and a line
    getLinePointDistance2(x, y, x1, y1, x2, y2) {
        const sqrt = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
        if (0 === sqrt)
            return 0;

        const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);

        return (numerator * numerator) / sqrt;
    }
}
