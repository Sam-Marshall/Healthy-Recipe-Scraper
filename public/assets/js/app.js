$(document).ready(function() {

    $(document).on('click', '#scrapeBtn', scrapeArticles);
    $(document).on('click', '.saveArticle', saveArticle);
    $(document).on('click', '.deleteArticle', deleteRecipe);
    $(document).on('click', '.newCommentSubmit', addComment);
    $(document).on('click', '.deleteComment', deleteComment);

    function deleteComment(event) {
    	event.preventDefault();
        var id = $(this).attr('id');
        console.log(id);
        $.ajax({
            url: "/comment/" + id,
            method: "DELETE"
        }).then(function(data) {
            window.location.reload();
        })
    }


    function addComment(event) {
        var comment = $('#newCommentAdd').val().trim();
        var id = $(this).attr('id');
        $.ajax({
            url: "/saved/" + id + "/" + comment,
            method: 'POST'
        }).then(function(data) {
            console.log(data);
        });
    }

    function deleteRecipe(event) {
        var id = $(this).attr('id');
        console.log(id);

        $.ajax({
            url: "/saved/" + id,
            method: "DELETE"
        }).then(function(data) {
            window.location.reload();
        });
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
