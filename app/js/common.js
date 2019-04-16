$(document).ready(function(){
  //Elastic Search
  $('#search').click(function(elasticSearch){
    elasticSearch.preventDefault();
      $('#search').removeClass('close').addClass('active');
      $('.btn-close').css({"display" : "flex"});
  });
  
  $('.btn-close').click(function(elasticSearch){
    $('.btn-close').css({"display" : "none"});
    $('#search.active').removeClass('active').addClass('close');
  });
  
  
  
  
});//end

