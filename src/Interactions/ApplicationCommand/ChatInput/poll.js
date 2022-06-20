module.exports = {
  name: 'poll',
  description: 'Open a Cool Poll',
  async respond(interaction) {
    return new Response(
      JSON.stringify({
        type: 9,
        data: {
          title: 'Democracy Bot Poll Maker',
          custom_id: 'poll',
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  style: 1,
                  custom_id: 'title',
                  label: 'Title',
                  min_length: 1,
                  max_length: 100,
                  placeholder: 'Poll Title',
                  required: true,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  style: 2,
                  custom_id: 'entries',
                  label: 'Entries',
                  min_length: 1,
                  max_length: 1100,
                  placeholder:
                    'Poll Entries.\nPut each entry in a separate line.\nExample:\n\nMy Cool Entry 1\nMy another cool entry 2 !',
                  required: true,
                },
              ],
            },
          ],
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
