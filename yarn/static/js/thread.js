function load_thread_from_href(e) {
    load_thread(e.target.rel);
}

function load_thread(thread_id) {
    $.ajax('rest/v1/thread/'+thread_id, { success: draw_new_thread, error: show_thread_error});
}

function show_thread_error() {
}

function draw_new_thread(data) {
    var source = $("#initial_thread_display").html();
    var tab_source = $("#thread_tab_display").html();
    var artifact_source = $("#artifact_display").html();
    var online_user_source = $("#online_user_display").html();

    var template = Handlebars.compile(source);
    var tab_template = Handlebars.compile(tab_source);
    var artifact_template = Handlebars.compile(artifact_source);
    var online_user_template = Handlebars.compile(online_user_source);

    var rendered_artifacts = [];
    for (var i = 0; i < data.artifacts.length; i++) {
        var artifact = data.artifacts[i];
        rendered_artifacts.push({
            artifact: artifact_template(artifact)
        });
    }

    var rendered_users = [];
    for (var i = 0; i < data.online_users.length; i++) {
        var user = data.online_users[i];
        rendered_users.push({
            user: online_user_template(user)
        });
    }

    var initial_content = template({
        thread: data.thread,
        thread_id: data.thread.id,
        topic: data.thread.description,
        artifacts: rendered_artifacts,
        online_users: rendered_users
    });

    var tab_content = tab_template({
        thread_id: data.thread.id,
        thread_name: data.thread.name
    });

    $($.parseHTML(tab_content)).appendTo("#tab_list");
    $($.parseHTML(initial_content)).appendTo("#tabs");
    refresh_thread_tabs();

    var index = $('#tabs a[href="#thread_'+data.thread.id+'"]').parent().index(); 
    $("#tabs").tabs("option", "active", index);

    $(".thread-text-input-"+data.thread.id).on("keydown", handle_thread_input_keydown);
}

function handle_thread_input_keydown(e) {
    if (e.keyCode == 13) {
        var target = e.target;
        var matches = target.className.match(/[0-9]+$/);

        if (target.value != "") {
            post_text_artifact(matches[0], target.value);
        }
        e.preventDefault();
        target.value = "";
    }
}

function post_text_artifact(thread_id, content) {
    var csrf_value = $("input[name='csrfmiddlewaretoken']")[0].value;
    $.ajax('rest/v1/thread/'+thread_id, {
        type: "POST",
        headers: {
            "X-CSRFToken": csrf_value
        },
        data: JSON.stringify({ type: "text", value: content }),
        dataType: 'json',
        success: handle_successful_artifact_post,
        error: handle_error_artifact_post
    });
}

function handle_successful_artifact_post() {
}

function handle_error_artifact_post() {
}

