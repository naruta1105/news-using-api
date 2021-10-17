$(document).ready(function (){
    //const APITOKEN = "token=c334532bff1e09a812ade46112153eee";
    const APITOKEN = "token=9f772b0b7beeb74d023479a891959e5d";
    const LINK = 'https://gnews.io/api/v4/';
    const TOPIC = ["Breaking-news","World","Nation","Business","Technology","Entertainment","Sports","Science","Health"];
    const LANG = [["English","en"],["French","fr"],["Japanese","ja"],["Chinese","zh"]];
    const COUNTRY = [["China","cn"],["Germany","de"],["France","fr"],["Japan","jp"],["United Kingdom","gb"],["United States","us"]];
    const SORTBY = [["By most recent date","publishedAt"],["By most match query","relevance"]];


    $('div').hide();

    getJSON("top-headlines");
    initSearchWindow(); // add element to select tag for dropdown

    $("#error").on("click",function() {
        $("#error").hide();
    })

    $("#btnOpenSearch").on("click", function(){
        $('#searchWindow,#searchWindow div').show();
    });

    $("#btnCancel").on("click", function(event){
        event.preventDefault(); // prevent auto loading
        document.getElementById('searchForm').reset(); //reset form
        $('#searchWindow,#searchWindow div').hide();
        //getJSON("search","q=example");
    });

    $("#btnSearch").on("click", function(event){
        event.preventDefault();
        $('#searchWindow,#searchWindow div').hide();
        if (makeQuery()) {
            $('#result-count').show();
            document.getElementById('searchForm').reset();
        }
    });

    function getJSON(endpoint,...queryPara){
        $('#loading').show();
        // Make request link
        queryPara = queryPara.concat(APITOKEN)
        const paraFormat = queryPara.join('&');
        const linkRequest = LINK + `${endpoint}?`+ paraFormat;
        console.log(linkRequest);

        // Make Object of Requesr depend on Browser
        const req = function () {
            if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
                return new XMLHttpRequest();
            } else if (window.ActiveXObject) { // IE 6 and older
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        }(); // without () => function
        
        // Make REQUEST
        req.onreadystatechange = function() {alertContents(req);};
        req.open("GET",linkRequest,true); // GET, POST, HEAD, true mean asynchronous
        req.send();

    };

    function alertContents(req) {
        try {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    showToScreen(req.responseText);
                } else {
                    $('div').hide();
                    $('#error').show();
                }
            }
        } 
        catch( e ) {
            $('div').hide();
            $('#error').show();
            console.error('Caught Exception: ' + e.description);
        }
        // wait 2s for loading picture
        setTimeout(function() { 
            $('#loading').hide();
        }, 2000);
    };

    function showToScreen(response) {
        $("main").empty();
        const json = JSON.parse(response);
        const nNew = json["totalArticles"]>10 ? 10 : json["totalArticles"];
        $("#result-count span").text(json["totalArticles"]);

        for (let i=0; i<nNew; i++){
            convertJSONtoHTML(json["articles"][i]);
        }
    }

    function convertJSONtoHTML(jsonElement) {
        const image = $("<img>").attr("src",jsonElement["image"]);
        const aside = $("<aside></aside>").append(image);

        const title =  $("<h2></h2>").append($("<a></a>").attr("href",jsonElement["url"])
                                                        .attr("title",jsonElement["description"])
                                                        .attr("target","_blank")
                                                        .text(jsonElement["title"]));
        const datetime = $("<p></p>").addClass("datetime").text(jsonElement["publishedAt"]);
        const content= $("<p></p>").addClass("content").text(jsonElement["content"]);
        const source= $("<p></p>").addClass("source").text("Source: ").append($("<a></a>").attr("href",jsonElement["source"]["url"])
                                                                                            .attr("target","_blank")
                                                                                            .text(jsonElement["source"]["name"]));

        const article = $("<article></article>").append(aside,title,datetime,content,source);
        $("main").append(article);
    }

    function initSearchWindow(){
        addValueToSelectElement("topicSearch", TOPIC);
        addValueToSelectElement("langSearch", LANG);
        addValueToSelectElement("countrySearch", COUNTRY);
        addValueToSelectElement("sortSearch", SORTBY);
    }

    function addValueToSelectElement(id, value){
        const nValue = value.length;
        for (let i=0; i<nValue; i++) {
            let valueElement = typeof value[i]=="string" ? value[i] : value[i][0];
            let option = $("<option></option>").attr("value",i).text(valueElement);
            $("#"+id).append(option);
        }
    }

    function addValueToSelectElement(id, value){
        const nValue = value.length;
        for (let i=0; i<nValue; i++) {
            let valueElement = typeof value[i]=="string" ? value[i] : value[i][0];
            let option = $("<option></option>").attr("value",i).text(valueElement);
            $("#"+id).append(option);
        }
    }

    function makeQuery () {
        const keyword = $("#search").val();
        const topic = $("#topicSearch").val();
        const lang = $("#langSearch").val();
        const country = $("#countrySearch").val();
        const sort = $("#sortSearch").val();
        const startDay = $("#start").val();
        const endDay = $("#end").val();
        let endpoint = "search";
        let query = [];

        if ((keyword.length<=0) && (topic==null)) {
            alert("Search Keyword or Topic must not be empty");
            return false;
        } else if ((startDay.length>0) && (endDay.length>0) && (startDay>endDay)) {
            alert("Time start and End not correct");
            return false;
        }
        
        if (keyword.length>0){
            query.push("q=" + keyword);
        }
        if (topic!=null){
            query.push("topic=" + TOPIC[topic].toLowerCase());
            endpoint = "top-headlines";
        }
        if (lang!=null){
            query.push("lang=" + LANG[lang][1]);
        }
        if (country!=null){
            query.push("country=" + COUNTRY[country][1]);
        }
        if (sort!=null){
            query.push("sortby=" + SORTBY[sort][1]);
        }
        if (startDay.length>0){
            query.push("from=" + startDay+"T00:00:00Z");
        }
        if (endDay.length>0){
            query.push("to=" + endDay+"T23:59:59Z");
        }
        getJSON(endpoint,...query); 
        return true;      
    }

});


/*
    fetch(link+APITOKEN)
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function (data) {
        console.log(data); // data = JSON.parse(req.responseText);
    })
    .catch(error => {
        //console.error('There has been a problem with your fetch operation:', error);
        console.log('There has been a problem with your fetch operation:', error);
    });
*/