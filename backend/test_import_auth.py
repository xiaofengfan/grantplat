try:
    from app.api.v1.auth import router as auth_router
    print("Auth router imported successfully")
    print(f"Auth router routes: {auth_router.routes}")
except Exception as e:
    print(f"Error importing auth router: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
