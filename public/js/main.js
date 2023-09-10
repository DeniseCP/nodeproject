// @ts-nocheck

// Function to delete Article
$('.delete-article').on('click', (e) => {
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
        type: 'DELETE',
        url: '/articles/' + id,
        success: ((_res) => {
            alert('Deleting Article');
            window.location.href = '/';
        }),
        error: ((err) =>
            console.log(err))
    });
});
