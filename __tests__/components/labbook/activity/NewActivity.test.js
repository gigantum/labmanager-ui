      import NewActivity from 'Components/labbook/activity/NewActivity';

      describe('NewActivity Fetch', ()=>{

        it('fetch returns activity', done => {

          NewActivity.getNewActivity('data-shader', 'owner').then((response)=>{

            if(response.error) {
              done.fail();
            } else {
              expect(response).toBeTruthy();
              done()
            }

          })

        })

        it('fetch returns null data', done => {

          NewActivity.getNewActivity('', '').then((response)=>{

            if(response.labbook.activityRecords === null) {

              expect(response.labbook.activityRecords).toBeNull();
              done();

            } else {
              done.fail()
            }

          })

        })

        it('fetch returns error', done => {

          NewActivity.getNewActivity(3, undefined).then((response)=>{


            if(response.error) {

              expect(response.error !== undefined).toBeTruthy();
              done();

            } else {
              done.fail()
            }

          })

        })

      })
