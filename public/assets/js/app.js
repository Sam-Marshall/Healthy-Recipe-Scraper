$(document).ready(function() {

    $(document).on('click', '#scrapeBtn', scrapeArticles);
    $(document).on('click', '.saveArticle', saveArticle);
    $(document).on('click', '.deleteArticle', deleteRecipe);
    $(document).on('click', '.newCommentSubmit', addComment);
    $(document).on('click', '.deleteComment', deleteComment);

    function deleteComment(event) {
        var id = $(this).attr('id');
        console.log(id);

        $.ajax({
            url: "/comment/" + id,
            method: "DELETE"
        });

        location.reload(true);
    }


    function addComment(event) {
        
        var id = $(this).attr('id');
        var comment = $('#newCommentAdd' + id).val().trim();

        $.ajax({
            url: "/saved/" + id + "/" + comment,
            method: 'POST'
        }).then(function(data) {
            console.log(data);
        });

        location.reload(true);
    }

    function deleteRecipe(event) {
        var id = $(this).attr('id');
        console.log(id);

        $.ajax({
            url: "/saved/" + id,
            method: "DELETE"
        });

        location.reload(true);
    }

    function scrapeArticles(event) {
        $.ajax({
            url: "/recipes",
            method: "GET"
        }).then(function(data) {
            console.log(data);
        });
    }

    function saveArticle(event) {

        var result = {};

        var link = $(this).attr('data-link');
        var pic = $(this).attr('data-image');

        var modLink = link.split('/').join('**');
        var modPic = pic.split('/').join('**');
        console.log($(this).attr('data-title'));

        result.title = $(this).attr('data-title');
        result.link = modLink;
        result.pic = modPic;

        $.ajax({
            url: "/recipes/" + result.title + "/" + result.link + "/" + result.pic,
            method: 'POST'
        }).then(function(data) {
            console.log(data);
        });

    }

});
