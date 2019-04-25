// Grab the articles as a json
$.getJSON("/beers", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#beertable").append(`
      <tr>
        <td>${data[i].rank}</td>
        <td><a href="https://www.ratebeer.com${data[i].url}">${data[i].name}</a></td>
        <td>${data[i].abv}%</td>
        <td>${data[i].score}</td>
        <td>${data[i].reviews}</td>
        <td><button class="btn btn-info notes" data-id="${data[i]._id}" data-toggle="modal" data-target="#exampleModalCenter">Notes</button></td>
      </tr>      
      `);
  }
});

$(document).on('show.bs.modal', '#exampleModalCenter', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var recipient = button.data('id') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  $('#saveNote').data('id', recipient)
  $.ajax({
    method: "GET",
    url: "/beers/" + recipient
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);

      // If there's a note in the article
      if (data.note) {
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
})

$(document).on('hide.bs.modal', "#exampleModalCenter", function (event) {
  $("#bodyinput").val("");
})

// When you click the savenote button
$(document).on("click", "#saveNote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).data("id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/beers/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      $("#exampleModalCenter").modal('hide')
      $("#bodyinput").val("");
    });

});
