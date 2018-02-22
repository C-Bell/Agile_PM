$(document).ready(() => {
  // Identify all our modals, modal close buttons and modal open buttons
  const deadlineModal = document.getElementById('deadlineModal');
  const deadlineBtn = document.getElementById('newdeadline');
  const deadlineSpan = document.getElementById('deadlineClose');

  const resourceModal = document.getElementById('resourceModal');
  const resourceBtn = document.getElementById('newresource');
  const resourceSpan = document.getElementById('resourceClose');

  const userModal = document.getElementById('userModal');
  const userBtn = document.getElementById('newuser');
  const userSpan = document.getElementById('userClose');

  // Get the current project ID for use in POST calls
  const url = window.location.href;
  const id = url.substring(url.lastIndexOf('/') + 1);

  // When the user clicks on the button, open the modal
  userBtn.onclick = function () {
    userModal.style.display = 'block';
  };

  // When the user clicks on <span> (x), close the modal
  userSpan.onclick = function () {
    userModal.style.display = 'none';
  };
  // When the user clicks on the button, open the modal
  deadlineBtn.onclick = function () {
    deadlineModal.style.display = 'block';
  };

  // When the user clicks on <span> (x), close the modal
  deadlineSpan.onclick = function () {
    deadlineModal.style.display = 'none';
  };

  resourceBtn.onclick = function () {
    resourceModal.style.display = 'block';
  };

  // When the user clicks on <span> (x), close the modal
  resourceSpan.onclick = function () {
    resourceModal.style.display = 'none';
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == resourceModal || event.target == deadlineModal || event.target == userModal) {
      deadlineModal.style.display = 'none';
      resourceModal.style.display = 'none';
      userModal.style.display = 'none';
    }
  };

  /*                Event Listeners           */

  // Event listener for the createDeadline span -
  $('#createDeadline').click((e) => {
    // Fetch the values from the modal
    console.log($('#deadlinedate').val());
    console.log($('#deadlinetitle').val());
    e.preventDefault();
    // Send to /deadlines/create
    $.ajax({
      type: 'POST',
      url: '/deadlines/create',
      data: {
        title: $('#deadlinetitle').val(),
        datetime: $('#deadlinedate').val(),
        project: id,
      },
      success(result) {
        // If we were successful, clear any errors rendered
        console.log(result);
        document.getElementById('taskErrorCode').innerHTML = '';
        document.getElementById('taskErrorMessage').innerHTML = '';
        window.location.reload();
      },
      error(result) {
        // If there was an error, render the server error on the page
        console.log(result);
        if (result.responseJSON != null) {
          document.getElementById('taskErrorCode').innerHTML = result.responseJSON.errorCode;
          document.getElementById('taskErrorMessage').innerHTML = result.responseJSON.errorMessage;
        }
      },
    });
  });

  //  Event listener for the createResource span -
  $('#createResource').click((e) => {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/resources/create',
      data: {
        name: $('#resourcetitle').val(),
        desc: $('#resourcedesc').val(),
        fromDate: $('#resourcefromdate').val(),
        toDate: $('#resourcetodate').val(),
        project: id,
      },
      success(result) {
        // On success, log and reload
        console.log(result);
        window.location.reload();
      },
      error(result) {
      // On error, display the error to the user
        console.log(result);
        if (result.responseJSON != null) {
          document.getElementById('resourceErrorCode').innerHTML = result.responseJSON.errorCode;
          document.getElementById('resourceErrorMessage').innerHTML = result.responseJSON.errorMessage;
        }
      },
    });
  });

  // https://www.w3schools.com/js/tryit.asp?filename=tryjs_confirm
  // Event listener for all X close buttons on the record cards
  $('.close').click((e) => {
    e.preventDefault();
    console.log(e.currentTarget.id);
    if (confirm('Are you sure you want to delete this item?')) {
      $.ajax({
        type: 'DELETE',
        url: '/delete',
        data: {
          id: e.currentTarget.id,
        },
        success(result) {
          // On success reload to see the changes
          console.log(result);
          window.location.reload();
        },
        error(result) {
          // On error alert the user of the error
          // We alert the user as there is no ideal location on-screen.
          console.log(result);
          alert(result.responseJSON.errorMessage);
        },
      });
    }
  });

  // Event listener for all + buttons on the User record cards (in the modal)
  $('.add').click((e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to add this user?')) {
      $.ajax({
        type: 'POST',
        url: '/projects/addUser',
        data: {
          userId: e.currentTarget.id,
          projectId: id,
        },
        success(result) {
          // On successful
          console.log(result);
          // Clear any previous errors
          document.getElementById('userErrorCode').innerHTML = '';
          document.getElementById('userErrorMessage').innerHTML = '';
          // Reload the page
          window.location.reload();
        },
        error(result) {
          console.log(result);
          if (result.responseJSON != null) {
            document.getElementById('userErrorCode').innerHTML = result.responseJSON.errorCode;
            document.getElementById('userErrorMessage').innerHTML = result.responseJSON.errorMessage;
          }
        },
      });
    }
  });

  // Event listener for all X buttons on the User record cards
  $('.remove').click((e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to remove this user?')) {
      $.ajax({
        type: 'POST',
        url: '/projects/removeUser',
        data: {
          userId: e.currentTarget.id,
          projectId: id,
        },
        success(result) {
          // If successful
          console.log(result);
          window.location.reload();
        },
        error(result) {
          // If we have an error, display the error to the user in an alert
          alert(result.responseJSON.errorMessage);
        },
      });
    }
  });

  // Event listener for the 'To Do', 'Doing', 'Done' buttons on the Deadline record cards
  $('.taskState').click((e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to update this task?')) {
      $.ajax({
        type: 'POST',
        url: '/deadlines/update',
        data: {
          deadlineId: e.currentTarget.id,
          newState: e.currentTarget.innerText,
        },
        success(result) {
          // On success - Reload to see changes
          console.log(result);
          window.location.reload();
        },
        error(result) {
          // On Error - Display in alert
          alert(result.responseJSON.errorMessage);
        },
      });
    }
  });
});
