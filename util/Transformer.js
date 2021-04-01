const helper = require('../util/helper');

module.exports = {
    author: function (author) {
        return {
            id: author.id,
            username: author.username,
            name: author.name,
            email: author.email,
            phone: author.phone,
            avatar_url: author.avatar_url ? author.avatar_url : 'http://d1j8r0kxyu9tj8.cloudfront.net/user.png',
            url: process.env.BASE_URL + "profile/" + author.username
        };
    },
    moreProductType: function (product) {
        return {
            id: product.id,
            thumb_url: product.thumb_url,
            rating: product.rating,
            linkId: helper.convertViToEng(product['title']).replace(/ /g, "-") + "-" + product.id
        };
    },
    productType: function (product) {
        let data = {
            title: product.title,
            views_count: product.views,
            created_at: helper.timeSince(new Date(Date.parse(product.created_at)))
        };
        if (data['title'] === null || data['title'] === "") {
            data['title'] = "Bài tập ColorME";
        }
        data['linkId'] = helper.convertViToEng(data['title']).replace(/ /g, "-") + "-" + product.id;

        switch (product.type) {
            case 0:
                data['thumb_url'] = product.thumb_url;
                data['image_url'] = product.url;
//                data['tags'] = product.tags;
                data['description'] = product.description;
                break;
            case 1:
                data['video_url'] = product.url;
//                data['tags'] = product.tags;
                data['description'] = product.description;
                break;
            case 2:
                if (product.thumb_name) {
                    data['thumb_url'] = product.thumb_url;
                    data['thumb_name'] = product.thumb_name;
                    data['image_url'] = product.url;
                } else {
                    data['video_url'] = product.url;
                    data['thumb_url'] = product.thumb_url;
                }
//                data['tags'] = product.tags;
                data['title'] = product.title;
                data['description'] = product.description;
                break;
            case 3:
                if (product.thumb_url) {
                    data['thumb_url'] = product.thumb_url;
                    data['image_url'] = product.url;
                    data['sub_type'] = 0;

                } else {
                    data['video_url'] = product.url;
                    data['sub_type'] = 1;
                }

//                data['tags'] = product.tags;
                data['title'] = product.title;
                data['description'] = product.description;
                break;
        }
        return data;
    }
};