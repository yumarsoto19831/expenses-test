/**
 * Created by Yumar Sotolongo Rivero on 28/8/2017.
 */

jQuery(window).ready(function() {
    $.support.cors = true;

    TableActionModule.init();


});

var TableDefinition = function(){

    var rowTemplate = function(data){
        return `<tr id="${data.id}">
                <td data-edit="editable">
                    <span>${data.description}</span>
                    <input hidden name="description" type="text" value="${data.description}" readonly="">
                </td>
                <td data-edit="editable">
                    <span>${data.amount}</span>
                    <input hidden name="amount" type="text" value="${data.amount}" readonly="">
                </td>
                <td class="" data-edit="editable">
                    <span>${data.date}</span>
                    <input hidden type="text" name="date" value="${data.date}" class="datepicker" data-format="yyyy-mm-dd" data-lang="en" readonly="">
                </td>
                <td class="" data-edit="editable">
                    <span>${data.type}</span>
                    <input hidden type="text" name="type" value="${data.type}" readonly="">
                </td>
                <td class="actions">
                    <a href="#" class="btn btn-default btn-xs btn-edit "><i class="fa fa-edit white"></i> <span class="hidden-xs">Edit</span> </a>
                    <a class="btn btn-default btn-xs btn-success btn-update hidden"><i class="fa fa-save white"></i> <span class="hidden-xs">Save</span>  </a>
                    <a href="#" class="btn btn-default btn-xs btn-cancel btn-danger hidden"><i class="fa fa-times white"></i> <span class="hidden-xs">Cancel</span> </a>
                    <a href="#" class="btn btn-default btn-xs btn-danger btn-delete"><i class="fa fa-trash white"></i> <span class="hidden-xs">Delete</span> </a>
                </td>
        </tr>`}

    var newRowTemplate = function(){
        return `<tr id="newRow">
                <td>
                    <input  name="description" type="text" value="">
                </td>
                <td>
                    <input  name="amount" type="text" value="" >
                </td>
                <td class="">
                    <input  type="text" name="date" value="" class="datepicker" data-format="yyyy-mm-dd" data-lang="en" >
                </td>
                <td class="">
                    <input  type="text" name="type" value="" >
                </td>
                <td>
                    <button class="btn btn-default btn-xs btn-info btn-save"><i class="fa fa fa-save white"></i> <span class="hidden-xs">Save</span> </button>
                    <a href="#" class="btn btn-default btn-xs btn-delete-row btn-danger "><i class="fa fa fa-undo white"></i> <span class="hidden-xs">Cancel</span> </a>
                </td>
        </tr>`}

    var createTableRow = function (data) {
        return rowTemplate(data);
    }

    var addNewRow = function(){
        return newRowTemplate();
    }

    return {
        createTableRow: createTableRow,
        addNewRow: addNewRow
    }

}();

var TableActionModule = function(){

    var rowSelected = null;
    var $rows = null;
    var confirmationMsg = function(description) {
        return `Delete <strong>${description}</strong> description? ` };

    var handleFillTable = function(){
        ExpensesServices.loadExpenses(function(data){
            $('#expenses-table').append(
                $.map(data, TableDefinition.createTableRow)
            );
            $rows = $('#expenses-table tbody tr');
            $('.datepicker').datepicker({
                format:	'yyyy-mm-dd'
            });
            $.bootstrapSortable({ applyLast: true })
        });
    };

    var handleRowDeleteBtn = function(){
        $('#expenses-table').on('click', 'tbody .btn-delete', function(e){
            e.preventDefault();
            rowSelected = $(this).closest("tr");
            $('#confirmationMsg').html(confirmationMsg($(rowSelected).find('input[name="description"]').val()));
            $('#confirmationModal').modal('show');
        })
    }

    var handleDeleteBtn = function(){
        $('#btn-confirm-delete').on('click', function(e){
            e.preventDefault();
            ExpensesServices.deleteExpensive($(rowSelected).attr('id'), function(){
                $(rowSelected).remove();
                $('#confirmationModal').modal('hide');
                _toastr("Successfully Deleted!!","top-right","success",false);
            });
        })
    }

    var fillUpdateJsonData = function(rowSelected){
        var data = {
            "description":rowSelected.find('input[name="description"]').val(),
            "amount":rowSelected.find('input[name="amount"]').val(),
            "date":rowSelected.find('input[name="date"]').val(),
            "type":rowSelected.find('input[name="type"]').val()
        }
        return JSON.stringify(data);
    }
    var handleUpdateBtn = function(){
        $('#expenses-table').on('click', 'tbody .btn-update', function(e){
            e.preventDefault();
            var data = fillUpdateJsonData($(rowSelected));
            ExpensesServices.updateExpensive(data,$(rowSelected).attr('id'), function(){
                $(rowSelected).find('.btn-cancel').trigger('click');
                $(rowSelected).find('td[data-edit="editable"] input').each(function(){
                    $(this).parent().find('span').html($(this).val());
                })
                _toastr("Successfully Updated!!","top-right","success",false);
            });
        })
    }

    var handleSaveBtn = function(){
        $('#expenses-table').on('click', 'tbody .btn-save', function(e){
            e.preventDefault();
            var $rowSelected =  $(this).closest("tr");
            var data = fillUpdateJsonData($rowSelected);
            ExpensesServices.createExpensive(data, function(data){
                $rowSelected.remove();
                $('#expenses-table').append(TableDefinition.createTableRow(data));
                $.bootstrapSortable({ applyLast: true });
                _toastr("Successfully Updated!!","top-right","success",false);
            });
        })
    }

    var handleEditBtn = function(){
        $('#expenses-table').on('click', 'tbody .btn-edit', function(e){
            e.preventDefault();
            rowSelected = $(this).closest("tr");
            $(rowSelected).find('td:not(.actions) span').hide();
            $(rowSelected).find('td[data-edit="editable"] input').each(function(){
                $(this).addClass('edit-row');
                $(this).removeAttr('readonly');
                $(this).show();
            })
            $(this).addClass('hidden');
            $(rowSelected).find('.btn-delete').addClass('hidden');
            $(rowSelected).find(' .btn-cancel').removeClass('hidden');
            $(rowSelected).find(' .btn-update').removeClass('hidden');
        })
    }

    var handleCancelBtn = function () {
        $('#expenses-table').on('click', 'tbody .btn-cancel', function(e){
            e.preventDefault();
            rowSelected = $(this).closest("tr");
            $(rowSelected).find('td[data-edit="editable"] input').each(function(){
                $(this).removeClass('edit-row');
                $(this).attr('readonly','');
                $(this).hide();
            })
            $(rowSelected).find('td span').show();
            $(this).addClass('hidden');
            $(rowSelected).find('.btn-update').addClass('hidden');
            $(rowSelected).find('.btn-edit').removeClass('hidden');
            $(rowSelected).find('.btn-delete').removeClass('hidden');
        })
    }

    var handleSearch =  function (){

        $('#searchInput').keyup(function() {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
            $rows.show().filter(function() {
                var description = $(this).find('input[name="description"]').val().replace(/\s+/g, ' ').toLowerCase();
                var amount = $(this).find('input[name="amount"]').val().replace(/\s+/g, ' ').toLowerCase();
                return !(~description.indexOf(val) || ~amount.indexOf(val));
            }).hide();
        });
    }

    var handleAddNewRow = function(){
        $('#addRowBtn').on('click', function(e){
            e.preventDefault();
            if(!$('#newRow').length){
                $('#expenses-table').prepend(TableDefinition.addNewRow);
                $('#newRow .datepicker').datepicker({
                    format:	'yyyy-mm-dd'
                });
            }
            });
    }

    var handleDeleteRow = function(){
        $('#expenses-table').on('click', '.btn-delete-row', function(e) {
                e.preventDefault();
                $(this).closest("tr").remove();
        })
    }

    return {
        init: function () {
            handleEditBtn();
            handleCancelBtn();
            handleSearch();
            handleFillTable();
            handleRowDeleteBtn();
            handleDeleteBtn();
            handleUpdateBtn();
            handleSaveBtn();
            handleAddNewRow();
            handleDeleteRow();
        }
    }
}();

var ExpensesServices = function(){

    var config = {"host": 'https://crmanager.es/'};
    var routes = {"all": 'expenses/',
                    "update": function(id){
                        return `expenses/${id} `
                    },
                    "delete": function(id){
                        return `expenses/${id} `
                    },
                    "create": 'expenses'};

    var loadExpenses = function(callback){
        $.ajax({
            url: config.host + routes.all,
            method: "GET",
            cache: "false",
            success: function(data, status, jqxhr) {
                callback(data);
            },
            error: function(jqxhr, status, errorMsg) {
                console.log('Server Error');
            }
        });
    };

    var createExpensive = function(data, callback){
        $.ajax({
            url: config.host + routes.create,
            method: "POST",
            dataType:'json',
            contentType: 'application/json',
            cache: "false",
            data: data,
            success: function(data, status, jqxhr) {
                callback(data);
            },
            error: function(jqxhr, status, errorMsg) {
                console.log('Server Error');
            }
        });
    };

    var updateExpensive = function(data,id, callback){
        $.ajax({
            url: config.host + routes.update(id),
            method: "PATCH",
            dataType:'json',
            contentType: 'application/json',
            cache: "false",
            data: data,
            success: function(data, status, jqxhr) {
                callback(data);
            },
            error: function(jqxhr, status, errorMsg) {
                console.log('Server Error');
            }
        });
    };

    var deleteExpensive = function(id, callback){
        $.ajax({
            url: config.host + routes.delete(id),
            method: "DELETE",
            cache: "false",
            success: function(data, status, jqxhr) {
                callback(data);
            },
            error: function(jqxhr, status, errorMsg) {
                console.log('Server Error');
            }
        });
    };

    return {
        init: function () {
            loadExpenses();
        },
        createExpensive: createExpensive,
        updateExpensive: updateExpensive,
        deleteExpensive: deleteExpensive,
        loadExpenses: loadExpenses
    }
}();
