#define FUSE_USE_VERSION 26

#include <node_api.h>
#include <napi-macros.h>

#include <fuse_lowlevel.h>
#include <fuse.h>

NAPI_METHOD(loaded_and_linked) {
  NAPI_ARGV(0)

  void *ptr = (void *) &fuse_get_context;

  NAPI_RETURN_INT32(ptr != NULL ? 1 : 0)
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(loaded_and_linked)
}
