function showMessage(from = 'Someone', subject = 'Default Subject', body = getBody()) {
  let message = `from:${from} | subject:${subject} | body:${body}`;
  console.log(message);
}

function getBody() {
  return 'Default Body';
}

showMessage();
showMessage('Devvrat', 'How are You?', 'Hey bud, how are you and family?');
