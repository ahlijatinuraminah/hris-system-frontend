var table;
function initializeTable() {
  table = $("#emptable").DataTable({
      processing: true,
      ordering: true,
      paging: true,
      pageLength:10,
      searching: true,
      ajax: url + "/api/Employee",
      type:'GET',
      columns: [                    
          //{ data: "name" },
          { "data": "name",
              render: function ( data, type, row) {
                var intials = getInitials(data);
                var content = '<span class="profileImage">'+intials+'</span>'
                    content += '<a href="detail.html?empcode='+row.emp_code+'" >'+data+'</a>';
                return content;
              }
          },
          { data: "position_name" },
          { data: "manager_name" },
          
          { "data": "employment_type",
              render: function ( data, type, row) {
                return '<span class="'+data +'">'+ data+'</span>';
              }
          },
          { data: "last_updated" },
         
      ],      
  });  
}

function getInitials(name){
  var names = name.split(" ");
  var intials = names[0].charAt(0) + (names.length == 1? " " : names[1].charAt(0));                
  return intials;
}

function loadData(){
  
  $.ajax({
    url: url +"/api/Employee/" + getParam("empcode"),
    type: "GET",    
    success: function (json) {
      $("#emp_code").val(json.data[0].emp_code);
      $("#name").html(json.data[0].name);
      $("#position").html(json.data[0].position_name);
      $("#manager").html(json.data[0].manager_name);
      $("#fullname").html(json.data[0].name);
      $("#address").html(json.data[0].address);
      $("#phone").html(json.data[0].phone);
      $("#email").html(json.data[0].email);
      $("#employment_type").html(json.data[0].employment_type);
      
      $("#join_date").html(new Date(json.data[0].join_date).toLocaleString());
      $("#last_updated").html(new Date(json.data[0].last_updated).toLocaleString());

      var intials = getInitials(json.data[0].name);
      $("#thumbnail").html(intials);
    },
  });

}

function bindFormData(){
  var empcode = getParam("empcode")
  
  if(empcode != null){    
    $.ajax({
      url: url +"/api/Employee/" + empcode,
      type: "GET",    
      success: function (json) {        
        
        $("#fullname").html(json.data[0].name);
        $("#positionname").html(json.data[0].position_name);
        $("#managername").html(json.data[0].manager_name);
        $("#last_updated").html(new Date(json.data[0].last_updated).toLocaleString());

        $("#emp_code").val(json.data[0].emp_code);
        $("#name").val(json.data[0].name);
        $("#address").val(json.data[0].address);
        $("#phone").val(json.data[0].phone);
        $("#email").val(json.data[0].email);
        $("#employment_type").val(json.data[0].employment_type);
        
        $("#join_date").val(json.data[0].join_date.substring(0, 10));
        $("#job_position").val(json.data[0].job_position);
        $("#manager").val(json.data[0].manager);
        

        var intials = getInitials(json.data[0].name);
        $("#thumbnail").html(intials);
      },
    });
  }

}

function getParam(param){
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);    
}

function editData(){
  window.location = "addedit.html?mode=edit&empcode="+getParam("empcode");
}

function addData(){
  window.location = "addedit.html?mode=add";
}

function GetAllManagers(){
  
  $.ajax({
    url: url +"/api/Employee/Manager",
    type: "GET",    
    success: function (json) {
      
      //$("#manager").append(new Option("Select Manager", "", true, true));
      $.each(json.data, function(index, value) {
        $("#manager").append('<option value="' + value.manager + '">' + value.manager_name + "</option>");
    });      
    },
  });

}

function GetAllPositions(){

  $.ajax({
    url: url +"/api/Position/",
    type: "GET",    
    success: function (json) {
      //$("#job_position").append(new Option("Select Position", "", true, true));
      $.each(json.data, function(index, value) {
        $("#job_position").append('<option value="' + value.id + '">' + value.name + "</option>");
    });      
    },
  });
  
}

function save() {
  var mode = getParam("mode")
  var type = (mode == 'add') ? "POST" : "PUT";
  if ($("form")[0].checkValidity()) {          
      $.ajax({
          url: url +"/api/Employee",                  
          type: type,
          dataType:"json",  
          contentType:'application/json',                       
          data: JSON.stringify({
            emp_code: $("#emp_code").val(),
            name: $("#name").val(),
            email: $("#email").val(),
            phone: $("#phone").val(),
            address: $("#address").val(),
            employment_type: $("#employment_type").val(),
            join_date: $("#join_date").val(),
            job_position: $("#job_position").val(),
            manager: $("#manager").val(),
          }),
          success: function (response) {
            window.location = "index.html";
          },         
          error: function (response) {
            window.location = "index.html";
          }
      });
  } else $("form")[0].reportValidity();
}

function drawEmpChart() {  
  $.ajax({  
      type: "GET",  
      url: url +"/api/Employee/",
      success: function (empData) { 

        var data = new google.visualization.DataTable();
        
        var r = empData.data;
                    data.addColumn('string', 'Entity');
                    data.addColumn('string', 'ParentEntity');
                    data.addColumn('string', 'ToolTip');
                    for (var i = 0; i < r.length; i++) {
                        var employeeId = r[i].emp_code;
                        var employeeName = r[i].name;
                        var designation = r[i].position_name;
                        var reportingManager = r[i].manager != null ? r[i].manager.toString() : '';
        
                        var intials = getInitials(employeeName);
                        data.addRows([[{
                            v: employeeId,
                            f: employeeName + '<div>(<span>' + designation + '</span>)</div><span class="profileImage">'+intials+'</span>'
                        }, reportingManager, designation]]);
                    }
                    var chart = new google.visualization.OrgChart($("#chart")[0]);
                    chart.draw(data, { allowHtml: true });


      },  
      failure: function (xhr, status, error) {  
          alert("Failure: " + xhr.responseText);  
      },  
      error: function (xhr, status, error) {  
          alert("Error: " + xhr.responseText);  
      }  
  });  
}  

function searchData(){
  var filter = parseInt($('#filter').val());
  var search = $('#search').val();
  
  if (search != "") {
    table.rows().column(filter).search(search).draw();   
  }
  else{
    table.search("").columns().search("").draw();
  }   
}

function filterData(){
  var emptype = $('#emptype').val();
  if (emptype != "") {
    table.rows().column(3).search(emptype).draw();   
  }
  else{
    table.search("").columns().search("").draw();
  }   
  
 
}