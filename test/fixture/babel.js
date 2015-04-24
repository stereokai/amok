console.log(`ok`);

if (typeof (window) !== `undefined`) {
  window.addEventListener(`change`, function(event) {
    console.log(`change ${event.detail}`);
  });

  window.addEventListener(`source`, function(event) {
    console.log(`source ${event.detail}`);
  });
}
  
