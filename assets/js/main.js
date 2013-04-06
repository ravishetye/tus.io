$(function() {
  $.timeago.settings = {
    strings: {
      prefixAgo: null,
      prefixFromNow: null,
      suffixAgo: "ago",
      suffixFromNow: "from now",
      seconds: "~1 min",
      minute: "~1 min",
      minutes: "%d min",
      hour: "%dh",
      hours: "%dh",
      day: "a day",
      days: "%d days",
      month: "about a month",
      months: "%d months",
      year: "about a year",
      years: "%d years",
      wordSeparator: " ",
      numbers: []
    }
  };

  loadGithubs().done(function(data) {
    var $githubs = $('#githubs');

    var template = '<span class="timeago" title="${created}">${created}</span>';
    template += '<img src="${gravatarSrc}" class="gravatar" />';
    template += '<p><a href="${userUrl}" class="author">${username}</a> ';
    template += '<span>{{html action}}</span>';
    template += ' <a href="${repoUrl}">${repoName}</a>${branch}</p>';

    for (var i = 0; i < data.data.length; i++) {
      var item = data.data[i];

      var userUrl     = item.actor.url.replace('//api.', '//').replace('/users/', '/');
      var repoUrl     = item.repo.url.replace('//api.', '//').replace('/repos/', '/');
      var gravatarSrc = item.actor.avatar_url + '&s=64';
      var username    = item.actor.login;
      var action      = '';
      var branch      = '';

      switch (item.type) {
        case 'IssuesEvent':
          action  = item.payload.issue.state + ' ';
          action += 'issue <a href="' + item.payload.issue.html_url + '">';
          action += item.payload.issue.title + '</a> in ';
          break;
        case 'CommitCommentEvent':
          action  = 'commented "' + item.payload.comment.body + '" ';
          action += 'on a commit to <a href="' + item.payload.comment.html_url + '">';
          action += item.payload.comment.path + '</a> in';
          break;
        case 'IssueCommentEvent':
          action  = 'commented on <a href="' + item.payload.comment.html_url + '">';
          action += item.payload.issue.title + '</a> in ';
          break;
        case 'PushEvent':
          action = 'pushed ' + item.payload.commits.length + ' commits to';
          break;
        case 'WatchEvent':
          action = 'is now watching ';
          break;
        case 'CreateEvent':
          // @TODO: Not tested for ref_type != 'branch'
          action = 'created a new ' + item.payload.ref_type + ' in';
          branch = ': ' + item.payload.ref;
          break;
        default:
          console.log(item.type, item);
          break;
      }

      var entry = $.tmpl(template,
        {
          gravatarSrc: gravatarSrc,
          userUrl: userUrl,
          username: username,
          repoUrl: repoUrl,
          repoName: item.repo.name,
          branch: branch,
          created: item.created_at,
          action: action
        }
      );
      $('<li/>').append(entry).appendTo($githubs);
    }

    $('span.timeago').timeago();
  });


  function loadGithubs() {
    var d = $.Deferred();

    var githubs = localStorage.getItem('githubs');
    try {
      githubs = JSON.parse(githubs);
    } catch (err) {
    }

    if (githubs) {
      d.resolve(githubs);
      return d;
    }

    $.getJSON('https://api.github.com/orgs/tus/events?per_page=100&callback=?', function(data, textStatus, jqXHR) {
      localStorage.setItem('githubs', JSON.stringify(data));
      d.resolve(data)
    });
    return d;
  }
});
