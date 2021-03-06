/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'knockout', 'Services/Account', 'Core/ImageFileResize', 'UI/ImagePreview', 'Site', 'Application'], function (require, exports, ko, account, ImageFileResize, ImagePreviewer, site, app) {
    requirejs(['css!content/Shopping/ProductEvaluate']);
    var Start = (function () {
        function Start() {
            this.selected = ko.observable(true);
        }
        return Start;
    })();
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.starts = [];
            this.imageUrls = ko.observableArray();
            this.imageDatas = ko.observableArray();
            this.imageThumbs = ko.observableArray();
            this.evaluation = ko.observable();
            this.anonymous = ko.observable(true);
            this.maxImageCount = 6;
            this.minWordCount = 10;
            this.maxWordCount = 100;
            this.productImageUrl = ko.observable();
            this.orderDetailId = ko.observable();
            this.submit = function () {
                var imageDatas = _this.imageDatas().join(site.config.imageDataSpliter);
                var imageThumbs = _this.imageThumbs().join(site.config.imageDataSpliter);
                var orderDetailId = _this.orderDetailId();
                return account.evaluateProduct(orderDetailId, _this.score(), _this.evaluation(), _this.anonymous(), imageDatas, imageThumbs)
                    .done(function (data) {
                    if (_this.page.submited)
                        _this.page.submited(data);
                    app.back();
                });
            };
            this.switchStart = function (item) {
                var MIN_SCORE = 1;
                var score;
                var item_index = 0;
                for (var i = 0; i < _this.starts.length; i++) {
                    if (item == _this.starts[i]) {
                        item_index = i;
                        break;
                    }
                }
                if (item_index == _this.score() - 1) {
                    if (item.selected()) {
                        score = _this.score() - 1;
                    }
                    else {
                        score = _this.score() + 1;
                    }
                }
                else {
                    score = item_index + 1;
                }
                if (score < MIN_SCORE)
                    score = MIN_SCORE;
                _this.score(score);
                for (var i = 0; i < _this.starts.length; i++) {
                    _this.starts[i].selected(i < _this.score());
                }
            };
            this.showImagePage = function (item) {
                var index = $.inArray(item, _this.imageUrls());
                _this.imagePreview.open({ imageUrls: _this.imageUrls(), currentIndex: index });
            };
            debugger;
            this.page = page;
            for (var i = 0; i < 5; i++) {
                this.starts[i] = new Start();
                this.starts[i].selected(true);
            }
            this.score = ko.observable(this.starts.length);
            var p = this.imagePreview = ImagePreviewer.createInstance();
            p.imageRemoved.add(function (index) {
                var item = _this.imageUrls()[index];
                _this.imageUrls.remove(item);
                var data = _this.imageDatas()[index];
                _this.imageDatas.remove(data);
            });
        }
        return Model;
    })();
    return function (page) {
        var model = new Model(page);
        page.load.add(function (sender, args) {
            model.productImageUrl(args.productImageUrl);
            model.orderDetailId(args.orderDetailId);
        });
        page.viewChanged.add(function () {
            var e = page.element.querySelector('[type="file"]');
            var imageFileResize = new ImageFileResize(e, { maxWidth: 800, maxHeight: 800 }, { maxWidth: 100, maxHeight: 100 });
            imageFileResize.imageResized = image_resized;
            ko.applyBindings(model, page.element);
        });
        function image_resized(urls, datas, thumbs) {
            for (var i = 0; i < urls.length; i++)
                model.imageUrls.push(urls[i]);
            for (var i = 0; i < datas.length; i++)
                model.imageDatas.push(datas[i]);
            for (var i = 0; i < thumbs.length; i++)
                model.imageThumbs.push(thumbs[i]);
        }
    };
});
