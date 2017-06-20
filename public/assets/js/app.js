$(document).ready(function() {

    $(document).on('click', '#scrapeBtn', scrapeArticles);
    $(document).on('click', '.saveArticle', saveArticle);


    function scrapeArticles(event) {
        $.ajax({
        	url: "/recipes",
        	method: "GET"
        }).then(function(data){
        	console.log(data);
        });
    }

    function saveArticle(event){
    	$.ajax({

    	}).then(function(data){
    		console.log(data);
    	});
    }

});
