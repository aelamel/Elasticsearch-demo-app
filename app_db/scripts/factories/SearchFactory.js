app.factory('SearchFactory',function(){
    return {
        formatHashtags : function (data) {
            var hashtags = _.pluck(data.entities.hashtags,"text");
            data.entities.hashtags.inline = hashtags.join(', ')
            console.log("data.entities.hashtags.inline =>",data.entities.hashtags.inline);
            return data;
        }
    }
});